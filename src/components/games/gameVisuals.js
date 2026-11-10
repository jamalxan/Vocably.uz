// O'yinlar markazi (GamesHub) va o'yin ekrani (GamePlayer) uchun umumiy vizual xaritalar:
// katalogdagi `icon` nomi -> lucide ikonka (topilmasa Gamepad2 — chaqiruvchida), `skill` -> rang (bir xil pushti ikonkalar o'rniga
// o'yin turini bir qarashda ajratish uchun). Tokenlar ikkala temada ham kontrastli.
import { BookOpen, Crosshair, Ear, Footprints, Headphones, Keyboard, Link2, ListChecks, Orbit, PenSquare, Rows, Swords } from 'lucide-react';

export const GAME_ICONS = { Link2, ListChecks, PenSquare, Ear, Headphones, Rows, BookOpen, Swords, Footprints, Keyboard, Crosshair, Orbit };

export const SKILL_TONE = {
  recall: 'bg-accent-soft text-accent',
  listening: 'bg-info-soft text-info',
  spelling: 'bg-warning-soft text-warning',
  context: 'bg-success-soft text-success',
  synonym: 'bg-primary-soft text-ink',
};

export function skillTone(skill) {
  return SKILL_TONE[skill] || SKILL_TONE.recall;
}
