# Imágenes: fotos de Daniel y bodegones (diseño v4 «Consulta con carácter», paleta Salvia y melocotón)

Al sustituir una imagen se usa el mismo nombre de archivo en `src/assets/img/`, así que no hay que tocar código.
Los prompts van en inglés porque los modelos de imagen siguen mejor las instrucciones en ese idioma.

---

## A. Fotos de Daniel (generadas a partir de una foto real)

### A0. Qué foto de referencia necesito
Cuanta mejor sea la referencia, más se parecerá. Lo ideal son 2 fotos; con 1 también funciona.
1. **De frente**, de pecho para arriba, mirando a cámara, con luz de día (junto a una ventana, sin flash). Sin gafas de sol, gorra ni filtros. Mínimo 1000 px de lado.
2. (Opcional) **Tres cuartos**, girado unos 30°, con la misma luz.

Sube la referencia y pega el prompt en el **mismo mensaje**. Pide 4 variantes. Sirven Gemini (Nano Banana), ChatGPT (imagen) y cualquier modelo que acepte imagen de referencia.

Comprueba cada resultado antes de quedártelo:
- [ ] Es él: nariz, ojos, cejas, nacimiento del pelo, barba y edad.
- [ ] Manos con 5 dedos y sin deformaciones.
- [ ] Ni texto ni logotipos en la ropa o la pantalla.
- [ ] No lleva bata ni estetoscopio, y no hay báscula ni cinta métrica.
- [ ] La ropa es igual en las 3 fotos (A1–A3). Si no lo es, vuelve a generarla con el bloque WARDROBE copiado tal cual.

Daniel tiene que estar de acuerdo con usar imágenes generadas de su cara. En cuanto haya una foto profesional real, esa tiene prioridad.

---

### A1. Retrato principal → `portrait.webp`
Uso: la portada (dentro de un marco en arco, que recorta los laterales y la parte de arriba) y el bloque «Sobre mí». Vertical 4:5; pide como mínimo 1600×2000 px. Él tiene que estar **centrado** para que el arco no le corte.

```
Photorealistic editorial portrait of the man in the attached reference photo, a nutritionist in his consulting space.
IDENTITY: Use the attached photo as the only identity reference. Keep this exact person: same face shape, eyes, eyebrows, nose, mouth, ears, hairline, hair length and colour, facial hair exactly as in the reference (do not add or remove a beard), same skin tone and same apparent age. Do not beautify, slim, de-age or change ethnicity. Natural skin texture with visible pores; no airbrushing.
WARDROBE: He wears a plain mid-navy crew-neck merino knit sweater (colour close to #2C3A55) over a white T-shirt whose collar is barely visible, no logos, no patterns, no jewellery except an optional simple watch.
POSE AND FRAMING: vertical 4:5, waist-up, body turned 20 degrees to his left, face turned to camera, looking straight into the lens with a relaxed, warm, closed-mouth smile. Hands loosely joined in front at waist height, partly visible at the bottom edge. Subject horizontally centred, eyes on the upper third line, top of the head about 14% below the top edge, at least 12% empty margin on both left and right of his shoulders (the image will be cropped by an arched frame).
SETTING: plain warm off-white plaster wall (colour close to #EFE4D8), slightly out of focus behind him, with the soft edge of a sage-green potted plant (olive tree) entering from the left edge, out of focus. Nothing else in the background.
LIGHT: soft natural window light from camera left, gentle fill from the right, soft natural shadow on the right cheek, warm daylight white balance (about 5200K), no harsh highlights.
CAMERA: 85 mm lens, f/2.8, eye level, shallow depth of field, sharp focus on the eyes, subtle natural film grain, true-to-life colours, slightly warm grade.
NEGATIVE: No white coat, no stethoscope, no scrubs, no scales, no measuring tape, no supplements or pills, no text, no logos, no watermark, no extra people, no distorted hands, no plastic skin, no HDR look, not an illustration, not a 3D render.
```

### A2. Trabajando → `working.webp`
Uso: bloque «Un acompañamiento basado en tu contexto» de las páginas de servicio. Cuadrado 1:1; pide 1600×1600 px.

```
Photorealistic lifestyle photograph of the man in the attached reference photo working as an online nutritionist at his desk.
IDENTITY: Use the attached photo as the only identity reference. Keep this exact person: same face shape, eyes, eyebrows, nose, mouth, ears, hairline, hair length and colour, facial hair exactly as in the reference (do not add or remove a beard), same skin tone and same apparent age. Do not beautify, slim, de-age or change ethnicity. Natural skin texture with visible pores; no airbrushing.
WARDROBE: He wears a plain mid-navy crew-neck merino knit sweater (colour close to #2C3A55) over a white T-shirt whose collar is barely visible, no logos, no patterns, no jewellery except an optional simple watch.
SCENE: square 1:1. He sits at a light oak wooden desk, seen from a three-quarter front angle (camera 40 degrees to his right, slightly above eye level). He is in the middle of a video call: the laptop screen faces him and is only seen from the side, so the screen content is NOT visible. He smiles naturally and gestures lightly with his right hand while talking; his left hand rests on an open paper notebook with a pen. On the desk, arranged naturally and in focus: a clear glass of water, a small off-white ceramic bowl with two lemons and one green apple, and the open notebook. Desk otherwise tidy; no other objects, no phone.
BACKGROUND: warm off-white wall (colour close to #EFE4D8), a large window on the left, out of frame, casting daylight, one green plant softly out of focus in the back right corner.
LIGHT: soft natural window daylight from the left, warm white balance (about 5200K), soft realistic shadows on the desk.
CAMERA: 35 mm lens, f/4, subject and desk items sharp, background gently blurred, true-to-life colours, slightly warm grade, editorial lifestyle look.
NEGATIVE: No white coat, no stethoscope, no scrubs, no scales, no measuring tape, no supplements or pills, no text, no logos, no watermark, no extra people, no distorted hands, no plastic skin, no HDR look, not an illustration, not a 3D render.
```

### A3. Avatar → `avatar.webp`
Uso: autor del blog y fichas pequeñas. Cuadrado 1:1; pide 800×800 px.
Genéralo **en la misma conversación** que A1 y escribe antes del prompt: «Same person, same sweater and same light as the previous portrait.»

```
Photorealistic head-and-shoulders headshot of the man in the attached reference photo.
IDENTITY: Use the attached photo as the only identity reference. Keep this exact person: same face shape, eyes, eyebrows, nose, mouth, ears, hairline, hair length and colour, facial hair exactly as in the reference (do not add or remove a beard), same skin tone and same apparent age. Do not beautify, slim, de-age or change ethnicity. Natural skin texture with visible pores; no airbrushing.
WARDROBE: He wears a plain mid-navy crew-neck merino knit sweater (colour close to #2C3A55) over a white T-shirt whose collar is barely visible, no logos, no patterns.
FRAMING: square 1:1, head and top of shoulders, face centred horizontally, eyes at 40% from the top, looking into the lens, friendly closed-mouth smile.
BACKGROUND: plain warm off-white wall (colour close to #EFE4D8), evenly lit, no objects.
LIGHT: soft window light from camera left, warm daylight white balance, no harsh shadows.
CAMERA: 85 mm, f/2.8, sharp eyes, true-to-life colours.
NEGATIVE: No white coat, no stethoscope, no text, no logos, no watermark, no extra people, no plastic skin, not an illustration.
```

Cuando las tengas, mándamelas tal cual (PNG o JPG). La conversión a WebP y los tamaños los hace la tarea de imágenes.

Por qué un jersey azul marino y una pared crema: sobre la paleta salvia el azul marino contrasta sin competir con el verde de la marca, y la pared crema enlaza con el fondo crema de la web. El olivo del fondo repite el verde salvia.

---

## B. Bodegones de comida (sustituyen a los recortes provisionales de Pexels)

Vuelven a usarse en el diseño v4: en la portada alrededor del retrato, en las cabeceras de servicio, en las miniaturas de la lista de servicios y en la franja verde final. Solo hacen falta estas **5**, con estos nombres exactos.

Mismo estilo para todas: vista cenital, luz dura de mediodía, un solo objeto, fondo blanco puro y PNG cuadrado de 2048×2048. La sombra la pone la web, así que da igual que la foto tenga una sombra corta. Después se recortan con fondo transparente: si tu herramienta lo permite, pide directamente «transparent background PNG»; si no, se encarga el coordinador (paso IMG).

Prompt base (cambia solo `{OBJECT}`):
```
Top-down studio photograph of {OBJECT}, centred on a seamless pure white background (#FFFFFF), hard direct midday sunlight from the upper left casting one short crisp shadow, vivid natural colours, ultra sharp texture with visible pulp and peel detail, medium-format look, isolated single object filling about 70% of the frame, no props, no hands, no text, no plate, no cutting board, square 1:1, photorealistic, not an illustration, not a 3D render.
```

| Archivo | {OBJECT} | Dónde se usa |
|---|---|---|
| `avocado.png` | half an avocado with the stone in, cut side up | portada, clínica, franja final |
| `lemon-a.png` | half a lemon, cut side up | portada, clínica, franja final |
| `lemon-b.png` | a thin round slice of lemon | portada, deportiva, pérdida de peso |
| `lemon-c.png` | half a lime, cut side up | deportiva |
| `grapefruit.png` | half a pink grapefruit, cut side up, juicy segments visible | pérdida de peso |

Comprueba: se ve un solo objeto entero, sin bordes cortados, sin plato ni tabla, el color es natural (no saturado tipo plástico) y la luz viene de arriba a la izquierda en todas las fotos.

## C. Correcciones (edición con IA)
Si una imagen sale casi bien, no la generes de nuevo: edítala en la misma conversación con uno de estos prompts.
- Cara poco parecida: `Keep the composition, clothes, background and light exactly the same. Only make the face match the attached reference photo more closely: same eyes, nose, eyebrows, hairline and beard. Do not change anything else.`
- Manos raras: `Keep everything identical. Only fix his hands so they look natural, with five fingers each, relaxed.`
- Ropa distinta en otra foto: `Keep everything identical. Change only his top to a plain mid-navy crew-neck merino knit sweater (colour close to #2C3A55) over a white T-shirt, no logos.`
- Fondo con objetos de más: `Keep the person exactly the same. Replace the background with a plain warm off-white plaster wall (colour close to #EFE4D8), slightly out of focus, with only the soft edge of an olive tree on the left.`
- Fruta con fondo: `Keep the object exactly the same. Remove the background completely and return a PNG with a transparent background, no shadow.`

## D. Tarjetas para compartir (WhatsApp, Telegram, LinkedIn)
No hacen falta imágenes: la web las genera sola en cada compilación (fondo verde salvia, título con la palabra en cursiva amarilla y una fruta). Cuando cambies las frutas por las definitivas, se regeneran automáticamente.
