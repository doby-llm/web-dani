import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import satori from 'satori';
import shared from '../../data/copy/shared.json';
import { color, seo } from '../../lib/seo';
import { brandCase } from '../../lib/text';

// Social card per route and per published article: 1200×630 PNG (WhatsApp and Telegram do not render SVG).
interface Card { title: string; tag: string; accent: number; object: string | null }

// Same category labels as blog/[slug].astro (SPEC §4.3 cat.*).
const categories: Record<string, string> = {
  'perdida-de-peso': 'Pérdida de peso',
  deportiva: 'Nutrición deportiva',
  clinica: 'Nutrición clínica',
  habitos: 'Hábitos',
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const cards: { params: { slug: string }; props: Card }[] = Object.values(seo).map(e => ({
    params: { slug: e.ogImage },
    props: { title: e.ogTitle, tag: e.ogTag, accent: e.ogAccent, object: e.ogObject },
  }));
  for (const post of posts) {
    cards.push({
      params: { slug: post.id },
      props: { title: post.data.title, tag: categories[post.data.category], accent: 0, object: null },
    });
  }
  return cards;
};

const fontFile = (name: string) => readFile(join(process.cwd(), 'src/assets/og-fonts', name));
const fonts = Promise.all([
  fontFile('fraunces-og-560.ttf'),
  fontFile('fraunces-og-italic-450.ttf'),
  fontFile('public-sans-og-500.ttf'),
  fontFile('public-sans-og-700.ttf'),
]).then(([serif, serifItalic, sans500, sans700]) => [
  { name: 'Fraunces', data: serif, weight: 560 as const, style: 'normal' as const },
  { name: 'Fraunces', data: serifItalic, weight: 450 as const, style: 'italic' as const },
  { name: 'Public Sans', data: sans500, weight: 500 as const, style: 'normal' as const },
  { name: 'Public Sans', data: sans700, weight: 700 as const, style: 'normal' as const },
]);

// Minimal element tree for satori (React-element shape, no JSX in .ts).
type Style = Record<string, string | number>;
type Node = string | { type: string; props: Record<string, unknown> };
const node = (type: string, style: Style, children?: Node | Node[]): Node => ({ type, props: { style, children } });

// Cut-outs are embedded at source size; the PNG output only carries the 360 px they are drawn at.
async function objectPng(name: string) {
  const buf = await readFile(join(process.cwd(), 'src/assets/img', `${name}.png`));
  return { src: `data:image/png;base64,${buf.toString('base64')}`, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const OBJECT_W = 360;

async function renderCard({ title, tag, accent, object }: Card): Promise<Uint8Array> {
  const paper = color('paper');
  const brand = color('brand');
  const sun = color('sun');
  const ink = color('ink');

  const words = title.split(' ');
  const cut = Math.max(0, words.length - accent);
  const titleSize = title.length > 70 ? 54 : title.length > 48 ? 62 : 72;
  // Satori does not flow mixed styles inline, so the accent words get their own italic line.
  const head = accent > 0 ? words.slice(0, cut).join(' ') : title;
  const tail = accent > 0 ? words.slice(cut).join(' ') : '';
  const titleLines: Node[] = [];
  if (head) titleLines.push(node('div', { display: 'flex' }, head));
  if (tail) titleLines.push(node('div', { display: 'flex', fontStyle: 'italic', fontWeight: 450, color: sun }, tail));

  let objectNode: Node | null = null;
  let cx = 980;
  let cy = 300;
  if (object) {
    const img = await objectPng(object);
    const h = Math.round(OBJECT_W * img.h / img.w);
    cy = 120 + h / 2;
    objectNode = { type: 'img', props: { src: img.src, width: OBJECT_W, height: h, style: { position: 'absolute', left: 1200 - 40 - OBJECT_W, top: 120, transform: 'rotate(-12deg)' } } };
  }

  const disc = node('div', { display: 'flex', position: 'absolute', left: cx - 280, top: cy - 280, width: 560, height: 560, borderRadius: 280, background: color('brand-tint'), opacity: 0.18 });

  const brandLine = node('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
    node('div', { display: 'flex', width: 56, height: 56, borderRadius: 12, background: paper, alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 560, fontSize: 24, color: brand }, 'DC'),
    node('div', { display: 'flex', flexDirection: 'column' }, [
      node('div', { display: 'flex', fontFamily: 'Fraunces', fontWeight: 560, fontSize: 34, color: paper }, brandCase(shared.header.brand_name)),
      node('div', { display: 'flex', fontFamily: 'Public Sans', fontWeight: 500, fontSize: 24, color: color('brand-soft') }, brandCase(shared.header.brand_role)),
    ]),
  ]);

  const pill = node('div', { display: 'flex', alignSelf: 'flex-start', marginBottom: 28, padding: '10px 22px', borderRadius: 999, background: sun, color: ink, fontFamily: 'Public Sans', fontWeight: 700, fontSize: 24 }, tag);
  const headline = node('div', { display: 'flex', flexDirection: 'column', width: 760, fontFamily: 'Fraunces', fontWeight: 560, fontSize: titleSize, lineHeight: 1.05, letterSpacing: -1, color: paper }, titleLines);
  // Full-height inner box (72 px padding) with flex-end: the title grows upwards and never leaves the card.
  const bottom = node('div', { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'absolute', left: 72, top: 72, width: 760, height: 630 - 144 }, [pill, headline]);

  const root = node('div', { display: 'flex', position: 'relative', flexDirection: 'column', width: 1200, height: 630, padding: 72, background: brand }, [
    disc,
    ...(objectNode ? [objectNode] : []),
    brandLine,
    bottom,
  ]);

  const svg = await satori(root as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await fonts });
  const png = new Resvg(svg).render().asPng();
  // Palette PNG keeps the cut-out photo under the 300 KB budget (SPEC §5); sharp is an Astro dependency (brief, step 7).
  return sharp(png).png({ palette: true, colours: 256, compressionLevel: 9 }).toBuffer();
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as Card);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
