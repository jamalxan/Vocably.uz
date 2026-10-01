import { describe, it, expect } from 'vitest';
import { reviewItemsFromParse } from './reviewSync';

describe('reviewItemsFromParse', () => {
  it('maps reading passageOrder and listening partOrder to target.partIndex', () => {
    const items = reviewItemsFromParse('t1', [
      { section: 'reading', passageOrder: 2, groupId: 'g1', type: 'diagram_label', reason: 'AI noaniq dedi' },
      { section: 'listening', partOrder: 3, groupId: 'g2', type: 'map_label', reason: 'rasm kerak' },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0].target).toEqual({ sectionKey: 'reading', partIndex: 2, groupId: 'g1' });
    expect(items[1].target).toEqual({ sectionKey: 'listening', partIndex: 3, groupId: 'g2' });
    expect(items[0].reason).toBe('low_confidence');
    expect(items[0].severity).toBe('warning');
  });

  it('uses missing_answer when the reason is about the answer key', () => {
    const [item] = reviewItemsFromParse('t1', [
      { section: 'listening', partOrder: 1, groupId: 'g', type: 'form', reason: "Javob kaliti topilmadi" },
    ]);
    expect(item.reason).toBe('missing_answer');
  });

  it('drops sections outside the schema enum', () => {
    expect(reviewItemsFromParse('t1', [{ section: 'vocab', groupId: 'g' }])).toEqual([]);
  });
});
