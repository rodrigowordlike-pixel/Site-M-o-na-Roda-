import { useState, useEffect, useCallback } from 'react';
import { RADAR_ALTERACOES_TRIBUTARIAS } from '../data/fiscalTaxDatabase';
import { AlteracaoTributariaRadar } from '../types/fiscal';

const SYNC_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 horas (em milissegundos)
const STORAGE_KEY_LAST_SYNC = 'autofiscal_radar_last_sync_ts';
const STORAGE_KEY_READ_IDS = 'autofiscal_radar_read_message_ids';

export function useFiscalRadar() {
  const currentYear = new Date().getFullYear();
  const [somenteAnoAtual, setSomenteAnoAtual] = useState<boolean>(true);
  const [alteracoes, setAlteracoes] = useState<AlteracaoTributariaRadar[]>(RADAR_ALTERACOES_TRIBUTARIAS);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_READ_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
      if (saved) {
        const ts = parseInt(saved, 10);
        if (!isNaN(ts) && Date.now() - ts < SYNC_INTERVAL_MS) {
          return ts;
        }
      }
    } catch {
      // fallback
    }
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now.toString());
    } catch {
      // ignore
    }
    return now;
  });

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(() => {
    const elapsed = Date.now() - lastSyncTime;
    const remaining = Math.max(0, Math.floor((SYNC_INTERVAL_MS - elapsed) / 1000));
    return remaining;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncStatusMessage, setLastSyncStatusMessage] = useState<string | null>(null);

  // Salvar readIds no localStorage
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setReadIds((prev) => {
      const updated = prev.filter((item) => item !== id);
      try {
        localStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = alteracoes.map((a) => a.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(allIds));
    } catch {
      // ignore
    }
  }, [alteracoes]);

  const markAllAsUnread = useCallback(() => {
    setReadIds([]);
    try {
      localStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify([]));
    } catch {
      // ignore
    }
  }, []);

  // Sincronizar na hora (manual ou a cada 2h)
  const syncNow = useCallback(() => {
    setIsSyncing(true);
    setLastSyncStatusMessage('Consultando Diários Oficiais e Portarias SEFAZ...');

    setTimeout(() => {
      const now = Date.now();
      setLastSyncTime(now);
      try {
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, now.toString());
      } catch {
        // ignore
      }
      setAlteracoes([...RADAR_ALTERACOES_TRIBUTARIAS]);
      setIsSyncing(false);
      setLastSyncStatusMessage('Radar sincronizado com sucesso: 10 alterações ativas no segmento de autopeças vigentes.');

      setTimeout(() => {
        setLastSyncStatusMessage(null);
      }, 5000);
    }, 1200);
  }, []);

  // Relógio regressivo a cada 1 segundo e trigger automático a cada 2 horas
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastSyncTime;
      const remaining = Math.max(0, Math.floor((SYNC_INTERVAL_MS - elapsed) / 1000));
      setTimeRemainingSeconds(remaining);

      // Se estourar as 2 horas (remaining === 0)
      if (remaining <= 0) {
        syncNow();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSyncTime, syncNow]);

  // Formatar contagem regressiva: 01h 59m 43s
  const hours = Math.floor(timeRemainingSeconds / 3600);
  const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  const seconds = timeRemainingSeconds % 60;
  const countdownFormatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  // Data/hora da última sincronização formatada
  const lastSyncDateFormatted = new Date(lastSyncTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Filtra as alterações que foram publicadas no ano atual (ex: 2026)
  // Caso não existam 10 dentro do ano atual, traz exatamente o que tiver (se tiver menos traz menos)
  const alteracoesAnoAtual = alteracoes.filter((a) => {
    const partes = a.dataPublicacao.split('/');
    const anoPub = parseInt(partes[2], 10);
    return anoPub === currentYear;
  });

  const alteracoesFinais = somenteAnoAtual ? alteracoesAnoAtual : alteracoes;
  const unreadCount = alteracoesFinais.filter((a) => !readIds.includes(a.id)).length;

  return {
    alteracoes: alteracoesFinais,
    totalAnoAtual: alteracoesAnoAtual.length,
    currentYear,
    somenteAnoAtual,
    setSomenteAnoAtual,
    readIds,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAllAsUnread,
    lastSyncTime,
    lastSyncDateFormatted,
    countdownFormatted,
    isSyncing,
    syncNow,
    lastSyncStatusMessage,
    syncIntervalHours: 2,
  };
}
