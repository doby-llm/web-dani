# Copy deck: texto visible de la web de Daniel Clemente (fuente única para el rediseño)
Un YAML por página (`home.yaml` = `index.html`) y `_shared.yaml` con cabecera, aviso superior, pie y botones flotantes; 15 páginas, 45 secciones, 83 ítems.
Regla verbatim: cada cadena se copia tal cual de `src/*.html` (tildes, puntuación, `€` con espacio normal). Se omiten solo iconos decorativos (→ ✓ ↗ ✚ ⌁ ＋ ♡), la barra "/" delante de cada duración y el marcado HTML; se añaden campos extra útiles (`eyebrow`, `hero_proof`, `hero_images`, `prices`, `includes`, `badge`, `stamp`).
Cobertura: `jobs/coverage_check.py` comprueba 273 frases de `<main>` (≥25 caracteres) y 75 de cabecera/pie/avisos contra `_shared.yaml`: 0 faltantes.
Verificación inversa: `jobs/reverse_check.py` confirma que las 462 cadenas de los YAML aparecen literalmente en su página: 0 inventadas.
Los textos de la web siguen marcados como provisionales o pendientes de validación; este deck no los corrige.
