import { describe, it, expect } from 'vitest';
import { enqueueOffline, dequeueOffline, mergeQueuedIntoMessages } from './offlineQueue';

describe('enqueueOffline', () => {
  it('adds a new item to an empty queue', () => {
    const item = { clientMessageId: 'c1', conversationId: 'conv1', body: {}, message: {} };
    expect(enqueueOffline([], item)).toEqual([item]);
  });

  it('appends to the end, preserving order', () => {
    const a = { clientMessageId: 'a' };
    const b = { clientMessageId: 'b' };
    expect(enqueueOffline([a], b)).toEqual([a, b]);
  });

  it('does not add a duplicate clientMessageId', () => {
    const a = { clientMessageId: 'a', body: { text: 'first' } };
    const aAgain = { clientMessageId: 'a', body: { text: 'second' } };
    expect(enqueueOffline([a], aAgain)).toEqual([a]);
  });

  it('ignores items without a clientMessageId', () => {
    expect(enqueueOffline([], { conversationId: 'x' })).toEqual([]);
  });
});

describe('dequeueOffline', () => {
  it('removes the matching item by clientMessageId', () => {
    const a = { clientMessageId: 'a' };
    const b = { clientMessageId: 'b' };
    expect(dequeueOffline([a, b], 'a')).toEqual([b]);
  });

  it('is a no-op when the id is not present', () => {
    const a = { clientMessageId: 'a' };
    expect(dequeueOffline([a], 'missing')).toEqual([a]);
  });

  it('returns an empty array when queue is empty', () => {
    expect(dequeueOffline([], 'a')).toEqual([]);
  });
});

describe('mergeQueuedIntoMessages', () => {
  it('appends queued messages for the matching conversation, in queue order', () => {
    const messages = [{ id: 'm1', clientMessageId: 'server-1' }];
    const queue = [
      { conversationId: 'conv1', clientMessageId: 'c1', message: { clientMessageId: 'c1', text: 'a' } },
      { conversationId: 'conv1', clientMessageId: 'c2', message: { clientMessageId: 'c2', text: 'b' } },
    ];
    expect(mergeQueuedIntoMessages(messages, queue, 'conv1')).toEqual([
      { id: 'm1', clientMessageId: 'server-1' },
      { clientMessageId: 'c1', text: 'a' },
      { clientMessageId: 'c2', text: 'b' },
    ]);
  });

  it('ignores queued items for other conversations', () => {
    const messages = [];
    const queue = [{ conversationId: 'conv2', clientMessageId: 'c1', message: { clientMessageId: 'c1' } }];
    expect(mergeQueuedIntoMessages(messages, queue, 'conv1')).toEqual([]);
  });

  it('does not duplicate a message already present (by clientMessageId)', () => {
    const messages = [{ id: 'm1', clientMessageId: 'c1' }];
    const queue = [{ conversationId: 'conv1', clientMessageId: 'c1', message: { clientMessageId: 'c1' } }];
    expect(mergeQueuedIntoMessages(messages, queue, 'conv1')).toEqual(messages);
  });

  it('returns the same array reference when nothing to merge', () => {
    const messages = [{ id: 'm1' }];
    expect(mergeQueuedIntoMessages(messages, [], 'conv1')).toBe(messages);
  });
});
