// ... existing imports ...
import mongoose from 'mongoose';

// --- GAME DOMAIN MODELS ---

// GameSession: Tracks a single mini-game attempt
const GameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: { type: String, enum: ['memory', 'runner', 'lab', 'boss'], required: true },
  status: { type: String, enum: ['ready', 'in_progress', 'completed', 'abandoned', 'expired'], default: 'ready' },

  // Current state for the session (e.g., current word ID, current round)
  state: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Resulting data calculated server-side
  result: {
    score: { type: Number, default: 0 },
    grade: { type: String, enum: ['S', 'A', 'B', 'C', 'F'], default: null },
    xpEarned: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
  },

  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

GameSessionSchema.index({ userId: 1, status: 1 });

export const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);

// WorldProgress: Tracks overall game advancement
const WorldProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Unlocked zones/levels
  unlockedZones: [{ type: String, default: 'starter_island' }],

  // Quest completion status
  completedQuests: [{
    questId: String,
    completedAt: { type: Date, default: Date.now }
  }],

  // Total game-specific stats
  totalGameXp: { type: Number, default: 0 },
  currentLevel: { type: Number, default: 1 },

  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const WorldProgress = mongoose.models.WorldProgress || mongoose.model('WorldProgress', WorldProgressSchema);
