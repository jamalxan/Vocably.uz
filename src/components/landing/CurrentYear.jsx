'use client';
import { useEffect, useState } from 'react';

// Statik sahifada yil build vaqtida qotib qolmasligi uchun — brauzerda yangilanadi.
export default function CurrentYear({ initial }) {
  const [year, setYear] = useState(initial);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
}
