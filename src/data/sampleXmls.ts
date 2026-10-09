/**
 * Exemplos Realistas de NF-e em Formato XML
 * Cobrindo cenários comuns na rotina fiscal de empresas brasileiras
 */

export interface SampleNFe {
  id: string;
  titulo: string;
  descricao: string;
  cenario: string;
  xml: string;
}

export const SAMPLE_NFES: SampleNFe[] = [
  {
    id: 'sp_pr_autopecas',
    titulo: 'SP ➔ PR: Autopeças (ST Devida pelo Destinatário)',
    descricao: 'Operação interestadual SP para PR sem destaque de ST pelo remetente. Exige recolhimento antecipado pelo destinatário paranaense (Classificação C). Alíquota PR 19,5%.',
    cenario: 'Classificação C — ST Devida pelo Destinatário',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35240912345678000195550010000458921000458928" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00045892</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>45892</nNF>
        <dhEmi>2026-09-15T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>8</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>4.0</verProc>
      </ide>
      <emit>
        <CNPJ>12345678000195</CNPJ>
        <xNome>DISTRIBUIDORA PAULISTA DE PECAS LTDA</xNome>
        <xFant>PAULISTA AUTO PECAS</xFant>
        <enderEmit>
          <xLgr>AV INDUSTRIAL</xLgr>
          <nro>1500</nro>
          <xBairro>MOOCA</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>03100000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderEmit>
        <IE>112233445566</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>98765432000109</CNPJ>
        <xNome>AUTO PECAS CURITIBA COMERCIO VAREJISTA LTDA</xNome>
        <enderDest>
          <xLgr>RUA MARECHAL DEODORO</xLgr>
          <nro>800</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>4106902</cMun>
          <xMun>CURITIBA</xMun>
          <UF>PR</UF>
          <CEP>80010010</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>9012345678</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>PAR-8708</cProd>
          <cEAN>7891000001234</cEAN>
          <xProd>AMORTECEDOR DE SUSPENSAO DIANTEIRO VEICULOS</xProd>
          <NCM>87082999</NCM>
          <CEST>0100100</CEST>
          <CFOP>6102</CFOP>
          <uCom>PC</uCom>
          <qCom>20.0000</qCom>
          <vUnCom>250.0000</vUnCom>
          <vProd>5000.00</vProd>
          <cEANTrib>7891000001234</cEANTrib>
          <uTrib>PC</uTrib>
          <qTrib>20.0000</qTrib>
          <vUnTrib>250.0000</vUnTrib>
          <vFrete>150.00</vFrete>
          <vDesc>100.00</vDesc>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>5050.00</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>606.00</vICMS>
            </ICMS00>
          </ICMS>
          <IPI>
            <cEnq>999</cEnq>
            <IPITrib>
              <CST>50</CST>
              <vBC>5050.00</vBC>
              <pIPI>5.00</pIPI>
              <vIPI>252.50</vIPI>
            </IPITrib>
          </IPI>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>5050.00</vBC>
          <vICMS>606.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>5000.00</vProd>
          <vFrete>150.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>100.00</vDesc>
          <vII>0.00</vII>
          <vIPI>252.50</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>83.33</vPIS>
          <vCOFINS>383.80</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>5302.50</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`
  },
  {
    id: 'mg_rj_bebidas',
    titulo: 'MG ➔ RJ: Bebidas com ST e FCP-ST Retidos',
    descricao: 'Operação interestadual MG para RJ com retenção e destaque de ST e FCP-ST (2%) realizada pelo remetente substituto amparada pelo Convênio/Protocolo (Classificação B). Destinatário a recolher = R$ 0,00.',
    cenario: 'Classificação B — ST Já Retida na Origem',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe31240822334455000188550010000889101000889109" versao="4.00">
      <ide>
        <cUF>31</cUF>
        <cNF>00088910</cNF>
        <natOp>VENDA DE MERCADORIA COM ST</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>88910</nNF>
        <dhEmi>2026-08-20T14:15:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3106200</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>9</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>4.0</verProc>
      </ide>
      <emit>
        <CNPJ>22334455000188</CNPJ>
        <xNome>CERVEJARIA MINEIRA ARTESANAL S.A.</xNome>
        <xFant>CERVEJARIA MINEIRA</xFant>
        <enderEmit>
          <xLgr>RODOVIA BR 040 KM 500</xLgr>
          <nro>S/N</nro>
          <xBairro>DISTRITO INDUSTRIAL</xBairro>
          <cMun>3106200</cMun>
          <xMun>BELO HORIZONTE</xMun>
          <UF>MG</UF>
          <CEP>30000000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderEmit>
        <IE>0629988770011</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>55443322000177</CNPJ>
        <xNome>DISTRIBUIDORA CARIOCA DE BEBIDAS LTDA</xNome>
        <enderDest>
          <xLgr>AV BRASIL</xLgr>
          <nro>12000</nro>
          <xBairro>PENHA</xBairro>
          <cMun>3304557</cMun>
          <xMun>RIO DE JANEIRO</xMun>
          <UF>RJ</UF>
          <CEP>21012350</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>77889900</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>CERV-LATA-350</cProd>
          <cEAN>7898877665544</cEAN>
          <xProd>CERVEJA PURO MALTE LATA 350ML PACK C/ 12</xProd>
          <NCM>22030000</NCM>
          <CEST>0300100</CEST>
          <CFOP>6401</CFOP>
          <uCom>CX</uCom>
          <qCom>100.0000</qCom>
          <vUnCom>45.0000</vUnCom>
          <vProd>4500.00</vProd>
          <cEANTrib>7898877665544</cEANTrib>
          <uTrib>CX</uTrib>
          <qTrib>100.0000</qTrib>
          <vUnTrib>45.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS10>
              <orig>0</orig>
              <CST>10</CST>
              <modBC>3</modBC>
              <vBC>4500.00</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>540.00</vICMS>
              <modBCST>4</modBCST>
              <pMVAST>70.00</pMVAST>
              <vBCST>7650.00</vBCST>
              <pICMSST>20.00</pICMSST>
              <vICMSST>990.00</vICMSST>
              <vBCFCPST>7650.00</vBCFCPST>
              <pFCPST>2.00</pFCPST>
              <vFCPST>153.00</vFCPST>
            </ICMS10>
          </ICMS>
          <IPI>
            <cEnq>999</cEnq>
            <IPITrib>
              <CST>50</CST>
              <vBC>4500.00</vBC>
              <pIPI>6.00</pIPI>
              <vIPI>270.00</vIPI>
            </IPITrib>
          </IPI>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>4500.00</vBC>
          <vICMS>540.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>7650.00</vBCST>
          <vST>990.00</vST>
          <vFCPST>153.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>4500.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>270.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>74.25</vPIS>
          <vCOFINS>342.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>5913.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`
  },
  {
    id: 'rs_sc_simples',
    titulo: 'RS ➔ SC: Material Elétrico de Simples Nacional (MVA Original)',
    descricao: 'Emitente no Simples Nacional (CRT 1). Proibição expressa de MVA ajustada pelo Convênio ICMS 35/2011 e Convênio 142/2018. Exige aplicação da MVA original.',
    cenario: 'Aplicação de MVA Original (Convênio 35/2011)',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe43240733445566000177550010000123451000123456" versao="4.00">
      <ide>
        <cUF>43</cUF>
        <cNF>00012345</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>12345</nNF>
        <dhEmi>2026-07-10T16:00:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>4314902</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>6</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>4.0</verProc>
      </ide>
      <emit>
        <CNPJ>33445566000177</CNPJ>
        <xNome>GAUCHA ELETRO COMPONENTES EIRELI - ME</xNome>
        <xFant>GAUCHA ELETRO</xFant>
        <enderEmit>
          <xLgr>RUA DOS ANDRADAS</xLgr>
          <nro>450</nro>
          <xBairro>CENTRO HISTORICO</xBairro>
          <cMun>4314902</cMun>
          <xMun>PORTO ALEGRE</xMun>
          <UF>RS</UF>
          <CEP>90020000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderEmit>
        <IE>0960011223</IE>
        <CRT>1</CRT>
      </emit>
      <dest>
        <CNPJ>66778899000122</CNPJ>
        <xNome>CATARINA MATERIAIS ELETRICOS LTDA</xNome>
        <enderDest>
          <xLgr>RODOVIA SC 401</xLgr>
          <nro>3500</nro>
          <xBairro>SACO GRANDE</xBairro>
          <cMun>4205407</cMun>
          <xMun>FLORIANOPOLIS</xMun>
          <UF>SC</UF>
          <CEP>88032005</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>256789012</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>DISJ-BIP-32A</cProd>
          <cEAN>7896543210987</cEAN>
          <xProd>DISJUNTOR TERMOMAGNETICO BIPOLAR CURVA C 32A</xProd>
          <NCM>85365090</NCM>
          <CEST>1200100</CEST>
          <CFOP>6102</CFOP>
          <uCom>UN</uCom>
          <qCom>50.0000</qCom>
          <vUnCom>40.0000</vUnCom>
          <vProd>2000.00</vProd>
          <cEANTrib>7896543210987</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>50.0000</qTrib>
          <vUnTrib>40.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMSSN102>
              <orig>0</orig>
              <CSOSN>102</CSOSN>
            </ICMSSN102>
          </ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>2000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>2000.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`
  },
  {
    id: 'sp_ba_alerta_inconsistencia',
    titulo: 'SP ➔ BA: Alimentos com Inconsistências (⚠️ CÁLCULO NÃO CONFIRMADO)',
    descricao: 'Demonstração obrigatória da Regra de Segurança: CFOP iniciado por 5 em operação interestadual e CEST ausente em produto alimentício, gerando classificação D e marcação de cálculo não confirmado.',
    cenario: '⚠️ CÁLCULO NÃO CONFIRMADO (Inconsistência e CEST Ausente)',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35240999887766000155550010000078901000078901" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00007890</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>7890</nNF>
        <dhEmi>2026-09-02T11:20:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>1</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>4.0</verProc>
      </ide>
      <emit>
        <CNPJ>99887766000155</CNPJ>
        <xNome>INDUSTRIA PAULISTA DE BISCOITOS S/A</xNome>
        <enderEmit>
          <xLgr>RUA DA CONSOLACAO</xLgr>
          <nro>1000</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>01302000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderEmit>
        <IE>119988776655</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>44556677000199</CNPJ>
        <xNome>ATACADAO BAIANO DE GENEROS ALIMENTICIOS LTDA</xNome>
        <enderDest>
          <xLgr>AV TANCREDO NEVES</xLgr>
          <nro>500</nro>
          <xBairro>CAMINHO DAS ARVORES</xBairro>
          <cMun>2927408</cMun>
          <xMun>SALVADOR</xMun>
          <UF>BA</UF>
          <CEP>41820020</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>08998877</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>BISC-RECH-140G</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>BISCOITO RECHEADO SABOR CHOCOLATE 140G FARINHA TRIGO</xProd>
          <NCM>19053100</NCM>
          <!-- CEST omitido intencionalmente no XML para simular inconsistência legal -->
          <CFOP>5102</CFOP> <!-- CFOP iniciado por 5 em operação interestadual -->
          <uCom>CX</uCom>
          <qCom>80.0000</qCom>
          <vUnCom>35.0000</vUnCom>
          <vProd>2800.00</vProd>
          <cEANTrib>7891234567890</cEANTrib>
          <uTrib>CX</uTrib>
          <qTrib>80.0000</qTrib>
          <vUnTrib>35.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>2800.00</vBC>
              <pICMS>7.00</pICMS>
              <vICMS>196.00</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>2800.00</vBC>
          <vICMS>196.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>2800.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>46.20</vPIS>
          <vCOFINS>212.80</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>2800.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`
  }
];
