/**
 * Copia texto e abre URL na mesma interação (gesto do usuário — necessário para Clipboard API).
 * Retorna true se a cópia funcionou.
 */
export async function copyTextThenOpenUrl(url: string, text: string): Promise<boolean> {
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    /* permissão ou contexto inseguro */
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return copied;
}
