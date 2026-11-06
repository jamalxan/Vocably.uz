import { describe, it, expect } from 'vitest';
import { typedAcceptedForWord } from './typedForms';

describe('typedAcceptedForWord — optional letters, labels, phrase alternatives', () => {
  it('a bracket inside a word is an optional letter: both spellings, the bracket-free one first', () => {
    expect(typedAcceptedForWord('colo(u)r')).toEqual(['color', 'colour', 'colo(u)r']);
    expect(typedAcceptedForWord('behavio(u)r')).toEqual(['behavior', 'behaviour', 'behavio(u)r']);
    expect(typedAcceptedForWord('judg(e)ment')).toEqual(['judgment', 'judgement', 'judg(e)ment']);
    expect(typedAcceptedForWord('travel(l)er')).toEqual(['traveler', 'traveller', 'travel(l)er']);
    // touching a letter on one side is enough: a prefix or a suffix. The spaced reading follows (a
    // word written without a space, "interested(in)"), so it never changes the primary form.
    expect(typedAcceptedForWord('(un)able')).toEqual(['able', 'unable', 'un able', 'un-able', '(un)able']);
    expect(typedAcceptedForWord('colour(s)')).toEqual(['colour', 'colours', 'colour s', 'colour-s', 'colour(s)']);
  });

  it('a slash inside a word bracket picks one of its parts, never a fragment', () => {
    expect(typedAcceptedForWord('organi(s/z)e')).toEqual(['organise', 'organize', 'organi(s/z)e']);
    expect(typedAcceptedForWord('analy(s/z)e')).toEqual(['analyse', 'analyze', 'analy(s/z)e']);
    expect(typedAcceptedForWord('organi(s/z)ation')).toEqual(['organisation', 'organization', 'organi(s/z)ation']);
    expect(typedAcceptedForWord('some(one/thing)')).toEqual(['someone', 'something', 'some(one/thing)']);
    expect(typedAcceptedForWord('every(one/body)')).toEqual(['everyone', 'everybody', 'every(one/body)']);
  });

  it('a bracketed word or placeholder written without a space is still a word of its own', () => {
    // a placeholder is never joined to the word before it
    expect(typedAcceptedForWord('look after(sb)')).toEqual(['look after', 'look-after', 'look after sb', 'look after(sb)']);
    expect(typedAcceptedForWord('look after(sb/sth)')[0]).toBe('look after');
    expect(typedAcceptedForWord('look after(sb/sth)')).toEqual(expect.arrayContaining(['look after sb', 'look after sth']));
    expect(typedAcceptedForWord('look after(sb/it)')).toEqual(expect.arrayContaining(['look after', 'look after sb', 'look after it']));
    expect(typedAcceptedForWord('look after(sb/it)')).not.toContain('look afterit');
    // a word: joined first (the bracket-free primary form is unchanged), then typed as a word
    const interested = typedAcceptedForWord('interested(in)');
    expect(interested[0]).toBe('interested');
    expect(interested).toEqual(expect.arrayContaining(['interested', 'interested in']));
    const decision = typedAcceptedForWord('make(a) decision');
    expect(decision[0]).toBe('make decision');
    expect(decision).toEqual(expect.arrayContaining(['make decision', 'make a decision']));
  });

  it('a bracketed whole word is still left out or typed as a word', () => {
    expect(typedAcceptedForWord('in charge (of)')).toEqual(['in charge', 'in-charge', 'in charge of', 'in-charge-of', 'in charge (of)']);
    expect(typedAcceptedForWord('look after (sb)')).toEqual(['look after', 'look-after', 'look after sb', 'look after (sb)']);
    expect(typedAcceptedForWord('(be) responsible for')).toEqual(expect.arrayContaining(['responsible for', 'be responsible for']));
  });

  it('drops a [label] but keeps the headword as written', () => {
    expect(typedAcceptedForWord('ascertain [formal]')).toEqual(['ascertain', 'ascertain [formal]']);
    expect(typedAcceptedForWord('get by [informal] (on sth)')).toEqual(expect.arrayContaining(['get by', 'get by on', 'get by [informal] (on sth)']));
    // an unclosed bracket is plain text
    expect(typedAcceptedForWord('colo(u')).toEqual(['colo(u']);
    expect(typedAcceptedForWord('see [also')[0]).toBe('see [also');
  });

  it('a slash between multi-word phrases offers each phrase, the first one as the primary form', () => {
    for (const [word, a, b] of [
      ['deal with/cope with', 'deal with', 'cope with'],
      ['kind of/sort of', 'kind of', 'sort of'],
      ['get up/wake up', 'get up', 'wake up'],
      ['look for/search for', 'look for', 'search for'],
      ['rely on sb/depend on sb', 'rely on', 'depend on'],
    ]) {
      const forms = typedAcceptedForWord(word);
      expect(forms[0]).toBe(a);
      expect(forms).toEqual(expect.arrayContaining([a, b, `${a.replace(' ', '-')}`, word]));
      expect(forms.indexOf(b)).toBeLessThan(forms.indexOf(word));
    }
  });

  it('parallel phrases share a first or a last word; otherwise the slash is between single words', () => {
    // "look after/look for" read word by word would repeat a word ("look look for"): whole phrases
    expect(typedAcceptedForWord('look after/look for').slice(0, 4)).toEqual(['look after', 'look-after', 'look for', 'look-for']);
    expect(typedAcceptedForWord('figure out/work out')[0]).toBe('figure out');
    // a single-word alternative in the middle of a phrase: no fragment is ever an answer or the primary form
    for (const [word, a, b, fragments] of [
      ['get on/along with', 'get on with', 'get along with', ['get on', 'along with']],
      ['get on/along with sb', 'get on with', 'get along with', ['get on', 'along with', 'along with sb']],
      ['a great/good deal', 'a great deal', 'a good deal', ['a great', 'good deal']],
      ['on his/her own', 'on his own', 'on her own', ['on his', 'her own']],
      ['take part/place in', 'take part in', 'take place in', ['take part', 'place in']],
      ['x and/or y', 'x and y', 'x or y', ['x and', 'or y']],
      ['in the long/short term', 'in the long term', 'in the short term', ['in the long', 'short term']],
      ['at the end/beginning of', 'at the end of', 'at the beginning of', ['at the end', 'beginning of']],
      ["make up one's/your mind", 'make up ones mind', 'make up your mind', ['make up ones', 'your mind']],
      // "someone"/"something" are words here, not placeholders like sb/sth
      ['put someone/something off', 'put someone off', 'put something off', ['put someone', 'something off']],
      ['tell someone/something off', 'tell someone off', 'tell something off', ['tell someone', 'something off']],
      ['bring somebody/something up', 'bring somebody up', 'bring something up', ['bring somebody', 'something up']],
      ['take someone/something for granted', 'take someone for granted', 'take something for granted', ['take someone', 'something for granted']],
    ] as const) {
      const forms = typedAcceptedForWord(word);
      expect(forms[0], word).toBe(a);
      expect(forms, word).toContain(b);
      for (const f of fragments) expect(forms, `${word}: ${f}`).not.toContain(f);
    }
  });

  it('keeps the word-level reading for single-word alternatives and never accepts a lone word of a phrase', () => {
    expect(typedAcceptedForWord('look after/for')).toEqual(['look after', 'look-after', 'look for', 'look-for', 'look after/for']);
    expect(typedAcceptedForWord('look after/for')).not.toContain('for');
    // placeholders do not count as words: "tell sb/sth off" is one phrase, never "tell" or "off"
    const tell = typedAcceptedForWord('tell sb/sth off');
    expect(tell[0]).toBe('tell off');
    expect(tell).not.toContain('tell');
    expect(tell).not.toContain('off');
    // a slash inside brackets is not a phrase split
    expect(typedAcceptedForWord('look after (sb/sth) well')[0]).toBe('look after well');
    // Known gap, left as it is: a one-word side of a phrase ("despite") is not offered on its own.
    const spite = typedAcceptedForWord('in spite of/despite');
    expect(spite[0]).toBe('in spite of');
    expect(spite).not.toContain('despite');
  });

  it('keeps every form within MAX_FORMS (48) and always accepts the headword as written', () => {
    const word = 'aa/bb cc/dd ee/ff gg/hh ii/jj kk/ll';
    const forms = typedAcceptedForWord(word);
    expect(forms.length).toBeLessThanOrEqual(48);
    expect(forms[0]).toBe('aa cc ee gg ii kk');
    expect(forms).toContain(word);
  });

  it('does not parse a huge headword: one linear pass, only the headword as written', () => {
    const word = 'a('.repeat(50_000); // 100 KB, every "(" unclosed
    const t0 = performance.now();
    expect(typedAcceptedForWord(word)).toEqual([word]);
    expect(typedAcceptedForWord(`${'(x'.repeat(40_000)} `)).toEqual(['(x'.repeat(40_000)]);
    expect(typedAcceptedForWord(' '.repeat(100))).toEqual([]);
    expect(performance.now() - t0).toBeLessThan(100);
    // just under the cap a bracketed headword is still parsed
    expect(typedAcceptedForWord(`${'x'.repeat(70)} (of)`)).toContain('x'.repeat(70));
  });
});
