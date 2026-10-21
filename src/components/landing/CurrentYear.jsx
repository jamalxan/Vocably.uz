'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();

// Statik sahifada yil build vaqtida qotib qolmasligi uchun — brauzerda yangilanadi.
export default function CurrentYear({ initial }) {
  return useSyncExternalStore(subscribe, getYear, () => initial);
}
