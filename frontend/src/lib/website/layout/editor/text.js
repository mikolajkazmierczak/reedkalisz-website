// What a banner or a title says is kept as HTML, as the page renders it (a <br> between lines); the editor's fields
// are plain text, a line each. Anything else in the HTML (a style pasted along with the text) doesn't come back.
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };

export const toText = (html = '') =>
  html
    .replace(/<br\b[^>]*>|<div\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, e) => ENTITIES[e])
    .replace(/^\n+|\n+$/g, '');

export const toHtml = (text = '') =>
  text
    .split('\n')
    .map((line) => line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    .join('<br>');
