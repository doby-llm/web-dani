import tokens from '../styles/tokens.css?raw';
import seoData from '../data/seo.json';
import faq from '../data/copy/preguntas-frecuentes.json';
import { url } from './url';

export interface Crumb { name: string; path: string }

export interface SeoEntry {
  path: string;
  title: string | null;
  description: string | null;
  ogTitle: string;
  ogTag: string;
  ogImage: string;
  ogObject: string | null;
  ogAccent: number;
  crumbs: Crumb[];
}

export const seo = seoData as Record<string, SeoEntry>;

// Colours are read from the PALETTE block of tokens.css (R14). No hex literal lives in this repo's code.
const palette = tokens.slice(tokens.indexOf('PALETTE:BEGIN'), tokens.indexOf('PALETTE:END'));
export function color(name: string): string {
  const m = palette.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (!m) throw new Error(`--${name} is missing from the PALETTE block of tokens.css`);
  return m[1];
}

export const absolute = (path: string) => new URL(url(path), import.meta.env.SITE).href;

export const SITE_NAME = 'Daniel Clemente · Nutricionista';

export interface ArticleLd {
  headline: string;
  description: string;
  published: string;
  modified?: string;
}

// @graph shared by every page (WebSite, Person, ProfessionalService) plus the page's own type.
// No Offer, MedicalBusiness, Physician or Drug (SPEC §5, provisional prices).
export function jsonLd(page: { key: string; path: string; crumbs: Crumb[]; article?: ArticleLd }) {
  const home = absolute('');
  const personId = `${home}#daniel`;
  const graph: Record<string, unknown>[] = [
    { '@type': 'WebSite', '@id': `${home}#website`, url: home, name: SITE_NAME, inLanguage: 'es-ES' },
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Daniel Clemente',
      jobTitle: 'Nutricionista',
      alumniOf: [
        { '@type': 'CollegeOrUniversity', name: 'Universidad Europea de Madrid' },
        { '@type': 'CollegeOrUniversity', name: 'Universidad Católica de Murcia' },
      ],
      knowsAbout: ['Pérdida de peso', 'Nutrición deportiva', 'Nutrición clínica', 'Composición corporal'],
      url: absolute('sobre-mi/'),
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${home}#service`,
      name: SITE_NAME,
      url: home,
      areaServed: { '@type': 'Country', name: 'ES' },
      founder: { '@id': personId },
      serviceType: ['Nutrición online'],
      availableLanguage: 'es',
    },
  ];

  if (page.crumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: page.crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absolute(c.path) })),
    });
  }

  if (page.key === 'preguntas-frecuentes') {
    const items = faq.sections.find(s => s.id === 'faq')!.items;
    graph.push({
      '@type': 'FAQPage',
      mainEntity: items.map(i => ({ '@type': 'Question', name: i.title, acceptedAnswer: { '@type': 'Answer', text: i.text } })),
    });
  }

  if (page.article) {
    const a = page.article;
    graph.push({
      '@type': 'BlogPosting',
      headline: a.headline,
      description: a.description,
      datePublished: a.published,
      dateModified: a.modified ?? a.published,
      author: { '@id': personId },
      image: absolute(`og/${page.key}.png`),
      mainEntityOfPage: absolute(page.path),
      url: absolute(page.path),
      inLanguage: 'es-ES',
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
