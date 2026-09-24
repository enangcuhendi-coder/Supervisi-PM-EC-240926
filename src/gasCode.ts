/**
 * Import file Code.gs dan gas/Index.html secara langsung menggunakan fitur ?raw Vite
 */
import codeGsRaw from '../Code.gs?raw';
import indexHtmlRaw from '../gas/Index.html?raw';

export const CODE_GS_SOURCE: string = codeGsRaw;
export const INDEX_HTML_SOURCE: string = indexHtmlRaw;
