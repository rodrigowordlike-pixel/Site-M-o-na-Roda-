import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';

export interface GeneratePdfOptions {
  filename?: string;
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
}

/**
 * Gera e baixa um arquivo PDF no padrão A4 oficial a partir de um elemento HTML usando html-to-image (altamente robusto para CSS moderno e SVGs)
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const { filename = 'relatorio-fiscal.pdf', orientation = 'portrait' } = options;

  try {
    // Gera o canvas usando html-to-image que lida perfeitamente com Tailwind CSS v4, SVGs e fontes
    const canvas = await toCanvas(element, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      filter: (node) => {
        // Opcional: ignorar elementos com a classe no-print
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    // Se couber em 1 página
    if (imgHeight <= pageHeight) {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Paginação automática A4 para relatórios longos
      let heightLeft = imgHeight;
      let position = 0;
      const pageCanvasHeight = (canvas.width * pageHeight) / pageWidth;

      while (heightLeft > 0) {
        if (position > 0) {
          pdf.addPage();
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageCanvasHeight, canvas.height - (position * pageCanvasHeight));

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            position * pageCanvasHeight,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL('image/png');
          const sliceHeight = (pageCanvas.height * pageWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 0, 0, pageWidth, sliceHeight, undefined, 'FAST');
        }

        position++;
        heightLeft -= pageHeight;
      }
    }

    // Método robusto de download via Blob URL para navegadores modernos e iframe preview
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 3000);
  } catch (err) {
    console.error('Erro ao gerar PDF com html-to-image, acionando impressão nativa:', err);
    window.print();
  }
}
