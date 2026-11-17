const flag = (v: string | undefined, d: boolean) => v === undefined || v === '' ? d : v === 'true';

export const INDEXABLE = flag(import.meta.env.PUBLIC_INDEXABLE, false);
export const PROVISIONAL = flag(import.meta.env.PUBLIC_PROVISIONAL, true);
export const SHOW_EDITORIAL = flag(import.meta.env.PUBLIC_SHOW_EDITORIAL, true);
export const FORM_ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT ?? '';
