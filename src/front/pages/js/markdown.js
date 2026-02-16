import { marked } from "marked";
import DOMPurify from "dompurify";

// Optional: nicer defaults
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdownToSafeHtml(mdText) {
  const rawHtml = marked.parse(mdText ?? "");
  // DOMPurify removes scripts / dangerous attrs
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
  return cleanHtml;
}

