import { describe, it, expect, vi, beforeEach } from 'vitest';

const exists = new Map();
vi.mock('@/lib/s3', () => ({ objectPresence: vi.fn(async (key) => exists.get(key)) }));
const updateOne = vi.fn(async () => ({}));
vi.mock('@/lib/models', () => ({ Block: {}, Conversation: {}, User: { updateOne: (...a) => updateOne(...a) } }));

const { pruneMissingPhotos } = await import('./avatars');

const photo = (id) => ({ _id: id, key: `avatars/u/${id}_f.jpg`, smallKey: `avatars/u/${id}_s.jpg` });

describe('pruneMissingPhotos', () => {
  beforeEach(() => {
    exists.clear();
    updateOne.mockClear();
  });

  it('removes only photos S3 reports as missing and keeps order', async () => {
    const [a, b, c] = [photo('a'), photo('b'), photo('c')];
    exists.set(a.smallKey, false).set(b.smallKey, true).set(c.smallKey, true);
    const left = await pruneMissingPhotos('u1', [a, b, c]);
    expect(left.map((p) => p._id)).toEqual(['b', 'c']);
    expect(updateOne).toHaveBeenCalledWith({ _id: 'u1' }, { $pull: { photos: { _id: { $in: ['a'] } } } });
  });

  it('keeps photos when the check is inconclusive (network error)', async () => {
    const a = photo('a');
    exists.set(a.smallKey, null);
    expect(await pruneMissingPhotos('u1', [a])).toEqual([a]);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('handles empty lists without touching the database', async () => {
    expect(await pruneMissingPhotos('u1', [])).toEqual([]);
    expect(await pruneMissingPhotos('u1', undefined)).toEqual([]);
    expect(updateOne).not.toHaveBeenCalled();
  });
});
