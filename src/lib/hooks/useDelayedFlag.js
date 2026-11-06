'use client';
import { useEffect, useState } from 'react';

// `flag` kamida `ms` davomida uzluksiz true bo'lsagina true qaytaradi (PARITY_PLAN WP8: "Ulanmoqda…"
// holati socket qisqa uzilishlarda yoki sahifa ochilishidagi birinchi ulanishda miltillamasin).
export function useDelayedFlag(flag, ms = 1500) {
  const [passed, setPassed] = useState(false);
  const [prevFlag, setPrevFlag] = useState(flag);
  if (prevFlag !== flag) {
    setPrevFlag(flag);
    setPassed(false);
  }
  useEffect(() => {
    if (!flag) return undefined;
    const id = setTimeout(() => setPassed(true), ms);
    return () => clearTimeout(id);
  }, [flag, ms]);
  return flag && passed;
}
