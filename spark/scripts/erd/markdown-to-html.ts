/**
 * Markdown → HTML für den ERD-Viewer.
 *
 * Wandelt eine Markdown-Datei aus `docs/` in einen HTML-Fragment-String um, der
 * zur Build-Zeit in `erd.html` injiziert wird. Zwei Dinge, die `marked` nicht von
 * sich aus leistet, werden hier ergänzt:
 *
 *   1. **Überschriften-IDs** im GitHub-Stil, damit das Inhaltsverzeichnis der
 *      Quelldatei im Viewer funktioniert. Alle IDs bekommen ein Präfix, weil das
 *      Fragment in eine Seite eingebettet wird, die schon eigene IDs vergibt.
 *   2. **Relative Links** werden vom Verzeichnis der Quelldatei auf das
 *      Ausgabeverzeichnis umgerechnet — sonst zeigen sie ins Leere, weil das
 *      HTML woanders liegt als die Markdown-Datei.
 *
 * Deterministisch, ohne Netzwerk: der Viewer bleibt offline nutzbar.
 */

import { posix } from "node:path";
import { Marked, type Tokens } from "marked";

/** Präfix für alle generierten Überschriften-IDs (Kollisionsschutz im Viewer). */
const HEADING_ID_PREFIX = "nc-";

/** Zeichen, die GitHub beim Slug verwirft: alles außer Buchstaben, Ziffern, Leerzeichen, Bindestrich. */
const SLUG_STRIP = /[^\p{L}\p{N} -]/gu;

/**
 * Überschrift → Anker-Slug nach GitHubs Regel: kleinschreiben, Satzzeichen
 * verwerfen, Leerzeichen zu Bindestrichen. Umlaute und ß bleiben erhalten —
 * genau so verlinkt das Inhaltsverzeichnis der Quelldatei.
 */
export function slugify(text: string): string {
  return text.toLowerCase().replace(SLUG_STRIP, "").replace(/ /g, "-");
}

/**
 * Vergibt fortlaufend eindeutige Slugs: kommt eine Überschrift zweimal vor,
 * bekommt die zweite ein `-1`, wie auf GitHub. Ohne das zeigen zwei Anker auf
 * dieselbe Stelle und der zweite Link springt an die falsche Position.
 */
function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** Ein Link, der das Dokument verlässt — absolut, Protokoll-relativ oder Mail. */
function isExternalHref(href: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(href);
}

/**
 * Rechnet einen dokumentrelativen Link vom Verzeichnis der Quelldatei auf das
 * Ausgabeverzeichnis um. Ein reiner Anker (`#abschnitt`) bekommt stattdessen das
 * ID-Präfix, damit er auf die umbenannten Überschriften im Viewer trifft.
 */
export function rewriteHref(href: string, fromDir: string, toDir: string): string {
  if (href.startsWith("#")) return `#${HEADING_ID_PREFIX}${href.slice(1)}`;
  if (isExternalHref(href)) return href;

  const [path, hash] = splitHash(href);
  if (!path) return href;

  const absolute = posix.normalize(posix.join(fromDir, path));
  const relative = posix.relative(toDir, absolute);
  return hash ? `${relative}#${hash}` : relative;
}

/** Trennt `pfad.md#abschnitt` in Pfad und Anker. */
function splitHash(href: string): [string, string | undefined] {
  const index = href.indexOf("#");
  return index === -1 ? [href, undefined] : [href.slice(0, index), href.slice(index + 1)];
}

export interface RenderMarkdownOptions {
  /** Verzeichnis der Quelldatei, repo-relativ und POSIX — z. B. `spec/erd`. */
  sourceDir: string;
  /** Verzeichnis der erzeugten HTML-Datei, repo-relativ und POSIX — z. B. `spec/erd/generated`. */
  outputDir: string;
}

/**
 * Rendert Markdown zu einem HTML-Fragment (ohne `<html>`-Rahmen) für die
 * Einbettung in den ERD-Viewer.
 */
export function renderMarkdown(markdown: string, options: RenderMarkdownOptions): string {
  const slug = createSlugger();
  // BOM entfernen: bleibt es stehen, klebt es vor dem ersten `#`, und marked
  // liest die Titelzeile als gewöhnlichen Absatz statt als Überschrift.
  const source = markdown.replace(/^\uFEFF/, "");
  const instance = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token) {
        const html = this.parser.parseInline(token.tokens);
        const id = `${HEADING_ID_PREFIX}${slug(plainText(token.tokens))}`;
        return `<h${token.depth} id="${id}">${html}</h${token.depth}>\n`;
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token) {
        const html = this.parser.parseInline(token.tokens);
        const href = rewriteHref(token.href, options.sourceDir, options.outputDir);
        const title = token.title ? ` title="${escapeAttribute(token.title)}"` : "";
        return `<a href="${escapeAttribute(href)}"${title}>${html}</a>`;
      },
      // Rohes HTML als Text ausgeben statt durchreichen. Das Ergebnis landet im
      // Viewer per innerHTML — ein durchgereichtes <script> würde dort laufen.
      // Die Quelldatei enthält keins, aber das darf nicht die Annahme sein,
      // auf der die Sicherheit des Viewers ruht.
      html(token) {
        return escapeText(token.text);
      },
    },
  });

  return instance.parse(source, { async: false });
}

/**
 * Reiner Text einer Inline-Token-Liste — Grundlage für den Anker-Slug.
 * Kindtokens gewinnen vor `text`, und `text` vor `raw`: nur so fällt bei
 * `**fett**` die Auszeichnung weg, die in `raw` noch enthalten wäre.
 */
function plainText(tokens: Tokens.Generic[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((token) => {
      if (token.tokens) return plainText(token.tokens);
      return token.text ?? token.raw ?? "";
    })
    .join("");
}

/** Escaped einen Wert für die Verwendung in einem HTML-Attribut. */
function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

/** Escaped die Zeichen, die sonst als Markup gelesen würden. */
function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
