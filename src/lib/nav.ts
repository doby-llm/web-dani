// Single source for navigation. Paths are relative to the base: pass them through url().
export const services = [
  { slug: 'perdida-de-peso', path: 'perdida-de-peso/', title: 'Pérdida de peso', icon: 'scale', svc: 'weight' },
  { slug: 'medico', path: 'perdida-de-peso/tratamiento-medico/', title: 'Pérdida de peso con tratamiento médico', short: 'Tratamiento médico', icon: 'stethoscope', svc: 'medical' },
  { slug: 'deportiva', path: 'nutricion-deportiva/', title: 'Nutrición deportiva', icon: 'dumbbell', svc: 'sport' },
  { slug: 'clinica', path: 'nutricion-clinica/', title: 'Nutrición clínica', icon: 'heart-pulse', svc: 'clinic' },
] as const;

export const primary = [
  { key: 'como', path: 'como-funciona/', label: 'Cómo funciona' },
  { key: 'programas', path: 'programas/', label: 'Programas' },
  { key: 'sobre', path: 'sobre-mi/', label: 'Sobre mí' },
  { key: 'blog', path: 'blog/', label: 'Blog' },
] as const;
