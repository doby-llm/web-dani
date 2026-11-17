const esc = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Escaped copy with the last `n` words wrapped in <em> (R19 italic accent).
   Trailing punctuation stays outside the <em>. Use with set:html.
   accent('Un plan a tu medida', 2) → 'Un plan a <em>tu medida</em>'
   accent('Hola', 0) → 'Hola' */
export function accent(text: string, n: number): string {
  if (n <= 0) return esc(text);
  const words = [...text.matchAll(/\S+/g)];
  if (!words.length) return esc(text);
  const start = words[Math.max(0, words.length - n)].index;
  const end = text.search(/[.,;:!?…»)]*$/);
  return esc(text.slice(0, start)) + '<em>' + esc(text.slice(start, end)) + '</em>' + esc(text.slice(end));
}

/* Brand words kept in shared.json as capitals; rendered as the mockups show them.
   Only fully uppercase input changes; anything else is returned as is.
   brandCase('DANIEL CLEMENTE') → 'Daniel Clemente'; brandCase('Nutricionista') → 'Nutricionista' */
export function brandCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|\s)(\S)/g, (_, sp: string, c: string) => sp + c.toUpperCase());
}
