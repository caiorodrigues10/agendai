/**
 * Guia de captura da foto da planilha (importação por imagem/OCR).
 *
 * A qualidade da foto é o que mais decide se o OCR acerta: a mesma
 * planilha photographada de frente, com luz boa e sem sombra é lida quase
 * inteira; a mesma planilha fotografada de lado, com sombra ou como print
 * de print perde telefone e valor.
 *
 * O piso de 693 px é a mesma régua do servidor (largura mínima da região
 * da tabela para ler telefone com segurança). A checagem aqui é um aviso
 * antecipado: a foto com menos de 693 px de largura **com certeza** fica
 * abaixo do piso — o servidor dá o erro definitivo.
 */

/** Piso de largura (px) da região da tabela — o mesmo do backend. */
export const OCR_MIN_TABLE_WIDTH_PX = 693;

/** Dicas curtas de captura (aparecem quando o dono escolhe uma imagem). */
export const DICAS_CAPTURA: string[] = [
  'Tabela inteira visível, sem cortar as bordas',
  'Foto de frente (a câmera parallel à tabela)',
  'Boa luz, sem sombra em cima da tabela',
  'Foto direta da planilha — não fotografe a tela de outra foto',
];

/** Aviso sobre texto manuscrito (sempre exige revisão do dono). */
export const AVISO_MANUSCRITO =
  'Letra de mão pode ser lida errada: confira cada célula antes de confirmar.';

/** Mensagem específica quando a foto está abaixo do piso de resolução. */
export function mensagemAbaixoDoPiso(larguraPx: number): string {
  return `Esta foto tem ${larguraPx} px de largura e o mínimo para ler a tabela é ${OCR_MIN_TABLE_WIDTH_PX} px. Tire a foto mais perto da tabela (ou envie a planilha em arquivo) e tente de novo.`;
}

/**
 * Lê a largura e a altura da imagem escolhida.
 *
 * Devolve `null` quando o navegador não consegue decodificar o arquivo
 * (formato estranho, arquivo quebrado): nesse caso quem avisa é o
 * servidor, com a mensagem do erro.
 */
export function lerDimensoesImagem(
  file: File,
): Promise<{ larguraPx: number; alturaPx: number } | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') {
      resolve(null);
      return;
    }

    const url = URL.createObjectURL(file);
    const imagem = new Image();

    const finalizar = (resultado: { larguraPx: number; alturaPx: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(resultado);
    };

    imagem.onload = () =>
      finalizar({ larguraPx: imagem.naturalWidth, alturaPx: imagem.naturalHeight });
    imagem.onerror = () => finalizar(null);
    imagem.src = url;
  });
}
