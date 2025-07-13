function getSimpleHtml() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const numChildren = body.getNumChildren();

  let html = '';
  let listStack = [];
  let openListItem = false;

  for (let i = 0; i < numChildren; i++) {
    const element = body.getChild(i);
    const type = element.getType();

    if (type === DocumentApp.ElementType.LIST_ITEM) {
      const listItem = element.asListItem();
      const nesting = listItem.getNestingLevel();
      const glyph = listItem.getGlyphType();
      const listTag = (glyph && glyph.toString().includes('NUMBER')) ? 'ol' : 'ul';
      const content = parseStyledTextWithBreaks(listItem).trim();

      while (nesting > listStack.length - 1) {
        if (openListItem) {
          html += '\n';
          openListItem = false;
        }
        html += `<${listTag}>\n`;
        listStack.push(listTag);
      }

      while (nesting < listStack.length - 1) {
        if (openListItem) {
          html += `</li>\n`;
          openListItem = false;
        }
        html += `</${listStack.pop()}>\n`;
      }

      if (openListItem) {
        html += `</li>\n`;
      }

      html += `<li>${content}`;
      openListItem = true;
    } else {
      if (openListItem) {
        html += `</li>\n`;
        openListItem = false;
      }

      while (listStack.length > 0) {
        html += `</${listStack.pop()}>\n`;
      }

      const paragraph = element.asParagraph();
      const heading = paragraph.getHeading();

      if (heading === DocumentApp.ParagraphHeading.TITLE || heading === DocumentApp.ParagraphHeading.SUBTITLE) {
        continue;
      }

      const tag = headingToTag(heading);
      const content = parseStyledTextWithBreaks(paragraph).trim();

      if (tag) {
        html += `<${tag}>${content}</${tag}>\n`;
      } else if (content !== '') {
        if (isPureHtmlBlock(content)) {
          html += `${content}\n`;
        } else {
          html += `<p>${content}</p>\n`;
        }
      }
    }
  }

  if (openListItem) {
    html += `</li>\n`;
  }
  while (listStack.length > 0) {
    html += `</${listStack.pop()}>\n`;
  }

  return html;
}

function parseStyledTextWithBreaks(paragraph) {
  let html = '';

  for (let i = 0; i < paragraph.getNumChildren(); i++) {
    const child = paragraph.getChild(i);
    const type = child.getType();

    if (type === DocumentApp.ElementType.TEXT) {
      const textElement = child.asText();
      const indices = textElement.getTextAttributeIndices();

      for (let j = 0; j < indices.length; j++) {
        const start = indices[j];
        const end = (j + 1 < indices.length) ? indices[j + 1] : textElement.getText().length;
        const text = textElement.getText().substring(start, end);
        const style = [];

        if (textElement.isBold(start)) style.push('strong');
        if (textElement.isItalic(start)) style.push('em');
        if (textElement.isUnderline(start)) style.push('u');

        let styledText = escapeHtml(text);
        for (let k = style.length - 1; k >= 0; k--) {
          styledText = `<${style[k]}>${styledText}</${style[k]}>`;
        }

        html += styledText;
      }

    } else if (type === DocumentApp.ElementType.TEXT_BREAK) {
      html += '<br>';
    } else if (type === DocumentApp.ElementType.INLINE_IMAGE) {
      const image = child.asInlineImage();
      const blob = image.getBlob();
      const contentType = blob.getContentType();
      const base64 = Utilities.base64Encode(blob.getBytes());
      html += `<img src="data:${contentType};base64,${base64}">`;
    }
  }

  return html;
}

function headingToTag(heading) {
  switch (heading) {
    case DocumentApp.ParagraphHeading.HEADING1: return 'grostitre';
    case DocumentApp.ParagraphHeading.HEADING2: return 'h2';
    case DocumentApp.ParagraphHeading.HEADING3: return 'h3';
    default: return null;
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isPureHtmlBlock(text) {
  const regex = /^<([a-zA-Z0-9-]+)(\s[^>]*)?>[\s\S]*<\/\1>$/;
  return regex.test(text.trim());
}

function test() {
  const html = getSimpleHtml();
  Logger.log(html);
}

function doGet(e) {
  try {
    const html = getSimpleHtml();
    return ContentService
      .createTextOutput(html)
      .setMimeType(ContentService.MimeType.HTML);
  } catch (err) {
    return ContentService
      .createTextOutput('Erreur: ' + err)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
