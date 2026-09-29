'use client';
import { useEffect } from 'react';
import { registerChapter, updateActiveChapter } from './store';

// Marks a section as a "chapter" of the scroll story: while it spans the
// middle of the viewport, the Learning Core flies to `name`'s preset and the
// backdrop crossfades to the dark palette if `dark`.
export default function useChapter(ref, name, { dark = false } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const unregister = registerChapter(el, name, dark);
    updateActiveChapter();
    return unregister;
  }, [ref, name, dark]);
}
