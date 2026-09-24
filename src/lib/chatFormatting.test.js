import { describe, it, expect } from 'vitest';
import { parseMessageFormatting } from './chatFormatting';

describe('parseMessageFormatting', () => {
  it('returns a single text token for plain text', () => {
    expect(parseMessageFormatting('salom dunyo')).toEqual([{ type: 'text', value: 'salom dunyo' }]);
  });

  it('returns nothing for empty/falsy input', () => {
    expect(parseMessageFormatting('')).toEqual([]);
    expect(parseMessageFormatting(null)).toEqual([]);
    expect(parseMessageFormatting(undefined)).toEqual([]);
  });

  it('parses **bold** text', () => {
    expect(parseMessageFormatting('salom **dunyo** !')).toEqual([
      { type: 'text', value: 'salom ' },
      { type: 'bold', value: 'dunyo' },
      { type: 'text', value: ' !' },
    ]);
  });

  it('parses _italic_ text', () => {
    expect(parseMessageFormatting('salom _dunyo_ !')).toEqual([
      { type: 'text', value: 'salom ' },
      { type: 'italic', value: 'dunyo' },
      { type: 'text', value: ' !' },
    ]);
  });

  it('parses bold and italic together', () => {
    expect(parseMessageFormatting('**qalin** va _kursiv_')).toEqual([
      { type: 'bold', value: 'qalin' },
      { type: 'text', value: ' va ' },
      { type: 'italic', value: 'kursiv' },
    ]);
  });

  it('does not treat a lone/unmatched marker as formatting', () => {
    expect(parseMessageFormatting('narx 10 * 2 = 20')).toEqual([{ type: 'text', value: 'narx 10 * 2 = 20' }]);
    expect(parseMessageFormatting('shirin_qovun')).toEqual([{ type: 'text', value: 'shirin_qovun' }]);
  });

  it('does not match across a newline', () => {
    expect(parseMessageFormatting('**qalin\nemas**')).toEqual([{ type: 'text', value: '**qalin\nemas**' }]);
  });
});
