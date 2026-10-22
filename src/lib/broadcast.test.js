import { describe, it, expect } from 'vitest';
import { describeTelegramMessage, parseButtonLine, normalizeButtons, splitTitleBody, inlineKeyboard } from './broadcast';

describe('describeTelegramMessage', () => {
  it('picks the largest photo and its caption', () => {
    const m = { photo: [{ file_id: 'small' }, { file_id: 'big' }], caption: ' Chegirma! ' };
    expect(describeTelegramMessage(m)).toMatchObject({ kind: 'photo', telegramFileId: 'big', text: 'Chegirma!', mime: 'image/jpeg' });
  });
  it.each([
    ['video', { video: { file_id: 'v', mime_type: 'video/mp4' } }, 'video/mp4'],
    ['voice', { voice: { file_id: 'o', mime_type: 'audio/ogg' } }, 'audio/ogg'],
    ['video_note', { video_note: { file_id: 'n' } }, null],
    ['document', { document: { file_id: 'd', mime_type: 'application/pdf', file_name: 'a.pdf' } }, 'application/pdf'],
    ['animation', { animation: { file_id: 'g', mime_type: 'video/mp4' } }, 'video/mp4'],
    ['audio', { audio: { file_id: 'a', mime_type: 'audio/mpeg' } }, 'audio/mpeg'],
  ])('%s', (kind, m, mime) => {
    expect(describeTelegramMessage(m)).toMatchObject({ kind, mime });
  });
  it('text only, and nothing for stickers/empty', () => {
    expect(describeTelegramMessage({ text: ' Salom ' })).toEqual({ kind: null, telegramFileId: null, mime: null, fileName: null, text: 'Salom' });
    expect(describeTelegramMessage({ sticker: { file_id: 's' } })).toBeNull();
    expect(describeTelegramMessage({})).toBeNull();
  });
});

describe('parseButtonLine / normalizeButtons', () => {
  it('parses "Matn | https://…" and rejects other schemes', () => {
    expect(parseButtonLine("Saytga o'tish | https://vocably.uz/pricing")).toEqual({ text: "Saytga o'tish", url: 'https://vocably.uz/pricing' });
    expect(parseButtonLine('A|http://x.uz')).toEqual({ text: 'A', url: 'http://x.uz/' });
    expect(parseButtonLine('A | javascript:alert(1)')).toBeNull();
    expect(parseButtonLine('A | not a url')).toBeNull();
    expect(parseButtonLine('no separator')).toBeNull();
    expect(parseButtonLine('')).toBeNull();
  });
  it('normalizeButtons drops invalid entries and caps at 4', () => {
    const list = [
      { text: 'A', url: 'https://a.uz' },
      { text: '', url: 'https://b.uz' },
      { text: 'C', url: 'ftp://c.uz' },
      { text: 'D', url: 'https://d.uz' },
      { text: 'E', url: 'https://e.uz' },
      { text: 'F', url: 'https://f.uz' },
      { text: 'G', url: 'https://g.uz' },
    ];
    expect(normalizeButtons(list).map((b) => b.text)).toEqual(['A', 'D', 'E', 'F']);
    expect(normalizeButtons('x')).toEqual([]);
    expect(inlineKeyboard([])).toBeUndefined();
    expect(inlineKeyboard([{ text: 'A', url: 'https://a.uz/' }])).toEqual({ inline_keyboard: [[{ text: 'A', url: 'https://a.uz/' }]] });
  });
});

describe('splitTitleBody', () => {
  it('first line is the title, the rest the body', () => {
    expect(splitTitleBody('Chegirma!\nBugun 50%\nShoshiling')).toEqual({ title: 'Chegirma!', body: 'Bugun 50%\nShoshiling' });
    expect(splitTitleBody('Faqat sarlavha')).toEqual({ title: 'Faqat sarlavha', body: '' });
    expect(splitTitleBody('', 'Rasm')).toEqual({ title: 'Rasm', body: '' });
  });
  it('a long single paragraph keeps the full text as body', () => {
    const long = 'a'.repeat(200);
    const out = splitTitleBody(long);
    expect(out.title).toHaveLength(120);
    expect(out.body).toBe(long);
  });
});
