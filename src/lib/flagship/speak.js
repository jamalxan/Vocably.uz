// "Gapir yoki yiqil" (speak or fall) rules — TZ 2.0 §7. Pure — tested in speak.test.js.
// 60 s on an IELTS Part 2 topic. Silence moves the character toward the cliff; the allowed pause
// shrinks every 15 s: 12 → 8 → 5 → 3 s. Speaking again resets the walk.

export const SPEAK = {
  roundMs: 60_000,
  stepMs: 15_000,
  limitsMs: [12_000, 8_000, 5_000, 3_000],
  /** Shorter gaps are breathing, not pauses — they don't go on the pause map. */
  minPauseMs: 1_000,
  calibrationMs: 700,
  /** Voice must stay quiet this long before we call it silence (bridges gaps between words). */
  hangoverMs: 300,
  minVoiceLevel: 0.02,
  noiseFactor: 2.5,
};

export function silenceLimitAt(elapsedMs) {
  const i = Math.min(SPEAK.limitsMs.length - 1, Math.max(0, Math.floor(elapsedMs / SPEAK.stepMs)));
  return SPEAK.limitsMs[i];
}

/** 0 = safe, 1 = at the edge. */
export function dangerLevel(silentMs, elapsedMs) {
  return Math.max(0, Math.min(1, silentMs / silenceLimitAt(elapsedMs)));
}

export function hasFallen(silentMs, elapsedMs) {
  return silentMs >= silenceLimitAt(elapsedMs);
}

/** RMS of a Float32 time-domain frame (-1..1). */
export function rmsLevel(frame) {
  if (!frame || !frame.length) return 0;
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / frame.length);
}

/**
 * Voice activity detector with a calibrated noise floor and a hangover.
 * feed(level, tMs) → { speaking, threshold }. The first `calibrationMs` only measure the room.
 */
export function createVad(opts = {}) {
  const cfg = { ...SPEAK, ...opts };
  let start = null;
  let floorSum = 0;
  let floorN = 0;
  let threshold = cfg.minVoiceLevel;
  let lastVoiceAt = -Infinity;
  return {
    feed(level, t) {
      if (start === null) start = t;
      if (t - start < cfg.calibrationMs) {
        floorSum += level;
        floorN += 1;
        threshold = Math.max(cfg.minVoiceLevel, (floorSum / floorN) * cfg.noiseFactor);
        return { speaking: false, threshold, calibrating: true };
      }
      if (level >= threshold) lastVoiceAt = t;
      return { speaking: t - lastVoiceAt <= cfg.hangoverMs, threshold, calibrating: false };
    },
  };
}

/**
 * Tracks silent stretches over the round. tick(speaking, elapsedMs) → { silentMs, fallen }.
 * Silence counts from the round start too, so staying quiet from the first second still fails.
 */
export function createSilenceTracker() {
  let silentSince = 0;
  let wasSpeaking = false;
  const pauses = [];
  return {
    tick(speaking, elapsedMs) {
      if (speaking) {
        if (!wasSpeaking && elapsedMs - silentSince >= SPEAK.minPauseMs && silentSince > 0) {
          pauses.push({ startMs: silentSince, endMs: elapsedMs });
        }
        wasSpeaking = true;
        return { silentMs: 0, fallen: false };
      }
      if (wasSpeaking) {
        silentSince = elapsedMs;
        wasSpeaking = false;
      }
      const silentMs = elapsedMs - silentSince;
      return { silentMs, fallen: hasFallen(silentMs, elapsedMs) };
    },
    /** Closes an open pause (on fall or time-up) and returns the map. */
    finish(elapsedMs) {
      if (!wasSpeaking && silentSince > 0 && elapsedMs - silentSince >= SPEAK.minPauseMs) {
        pauses.push({ startMs: silentSince, endMs: elapsedMs });
        silentSince = elapsedMs;
      }
      return pauses.slice();
    },
  };
}

const FILLERS = ['um', 'umm', 'uh', 'uhh', 'er', 'erm', 'ah', 'hmm', 'you know', 'i mean', 'sort of', 'kind of'];
const FILLER_RE = new RegExp(`\\b(${FILLERS.map((f) => f.replace(/ /g, '\\s+')).join('|')})\\b`, 'gi');

/** Filler words in a speech-recognition transcript ("like" is left out — too often a real verb). */
export function countFillers(transcript) {
  if (!transcript) return { total: 0, byWord: {} };
  const byWord = {};
  let total = 0;
  for (const m of String(transcript).toLowerCase().matchAll(FILLER_RE)) {
    const k = m[1].replace(/\s+/g, ' ');
    byWord[k] = (byWord[k] || 0) + 1;
    total += 1;
  }
  return { total, byWord };
}

export function speakSummary({ survivedMs, pauses, transcript, fell }) {
  const words = transcript ? String(transcript).trim().split(/\s+/).filter(Boolean).length : 0;
  const longest = pauses.reduce((m, p) => Math.max(m, p.endMs - p.startMs), 0);
  return {
    seconds: Math.round(Math.min(SPEAK.roundMs, survivedMs) / 1000),
    // A win needs the full minute; stopping early is neither a win nor a fall.
    survived: !fell && survivedMs >= SPEAK.roundMs - 250,
    stopped: !fell && survivedMs < SPEAK.roundMs - 250,
    pauses: pauses.length,
    longestPauseSec: Math.round(longest / 100) / 10,
    fillers: countFillers(transcript),
    words,
    wpm: words && survivedMs > 5000 ? Math.round(words / (survivedMs / 60_000)) : null,
  };
}

// IELTS Speaking Part 2 cue cards (original wording).
export const PART2_TOPICS = [
  { title: 'Describe a place you visited that you would like to go back to', points: ['where it is', 'when you went there', 'what you did there', 'why you want to return'] },
  { title: 'Describe a skill you learned that took a long time', points: ['what the skill is', 'how you learned it', 'what was difficult', 'how you use it now'] },
  { title: 'Describe a person who helped you make an important decision', points: ['who this person is', 'what the decision was', 'how they helped', 'how you felt afterwards'] },
  { title: 'Describe a book or film that changed how you think', points: ['what it was', 'when you read or watched it', 'what it was about', 'how it changed your view'] },
  { title: 'Describe a time you were very busy', points: ['when it was', 'what you had to do', 'how you managed your time', 'how you felt about it'] },
  { title: 'Describe a piece of technology you use every day', points: ['what it is', 'how often you use it', 'what you use it for', 'how life would be without it'] },
  { title: 'Describe a celebration you enjoyed', points: ['what was celebrated', 'who was there', 'what people did', 'why you enjoyed it'] },
  { title: 'Describe a goal you hope to achieve in the future', points: ['what the goal is', 'why it matters to you', 'what you are doing now', 'what could stop you'] },
  { title: 'Describe a time you helped someone', points: ['who you helped', 'what the problem was', 'what you did', 'how you felt'] },
  { title: 'Describe a city you would like to live in', points: ['which city', 'how you know about it', 'what life there is like', 'why you would live there'] },
  { title: 'Describe a hobby you would like to start', points: ['what the hobby is', 'why it interests you', 'what you need for it', 'who you would do it with'] },
  { title: 'Describe a time you received good news', points: ['what the news was', 'who told you', 'how you reacted', 'why it was important'] },
  { title: 'Describe a teacher who influenced you', points: ['who the teacher was', 'what subject they taught', 'what made them special', 'how they influenced you'] },
  { title: 'Describe a journey that took longer than expected', points: ['where you were going', 'why it took longer', 'what you did during the delay', 'how you felt'] },
  { title: 'Describe a website or app you find useful', points: ['what it is', 'how you found it', 'what you use it for', 'why it is useful'] },
  { title: 'Describe a meal you remember well', points: ['what you ate', 'where you had it', 'who you were with', 'why you remember it'] },
  { title: 'Describe an environmental problem in your area', points: ['what the problem is', 'what causes it', 'how it affects people', 'what could be done'] },
  { title: 'Describe a time you changed your mind', points: ['what the situation was', 'what you thought at first', 'what made you change', 'whether it was the right choice'] },
  { title: 'Describe a sport or game you enjoy', points: ['what it is', 'how you learned it', 'who you play with', 'why you enjoy it'] },
  { title: 'Describe a traditional product from your country', points: ['what it is', 'how it is made', 'who uses it', 'why it is important'] },
];

export function pickTopic(rand = Math.random, exclude = -1) {
  let i = Math.floor(rand() * PART2_TOPICS.length);
  if (i === exclude) i = (i + 1) % PART2_TOPICS.length;
  return i;
}
