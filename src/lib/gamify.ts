/**
 * Client-side gamification maths. Everything here is derived from data the app
 * already stores (attempts, results, streaks) — no extra tables required.
 */

export type GamifyInput = {
  testsTaken: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  bestScore: number;
};

export type Level = {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  progress: number; // 0..100
  title: string;
};

const LEVEL_TITLES = [
  "Rookie",
  "Learner",
  "Achiever",
  "Sharp Shooter",
  "Contender",
  "Scholar",
  "Strategist",
  "Top Gun",
  "Elite",
  "Legend",
];

/** XP: 40 per completed test, 1 per average-score point, 15 per streak day. */
export const computeXp = ({ testsTaken, averageScore, currentStreak }: GamifyInput) =>
  Math.round(testsTaken * 40 + averageScore + currentStreak * 15);

/** Each level costs 250 XP more than the last (250, 500, 750 …). */
export const computeLevel = (input: GamifyInput): Level => {
  const xp = computeXp(input);
  let level = 1;
  let remaining = xp;
  let cost = 250;
  while (remaining >= cost) {
    remaining -= cost;
    level += 1;
    cost += 250;
  }
  return {
    level,
    xp,
    xpIntoLevel: remaining,
    xpForLevel: cost,
    progress: Math.min(100, Math.round((remaining / cost) * 100)),
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
  };
};

export type BadgeDef = {
  id: string;
  label: string;
  hint: string;
  earned: boolean;
};

export const computeBadges = (input: GamifyInput): BadgeDef[] => [
  {
    id: "first-test",
    label: "First steps",
    hint: "Complete your first test",
    earned: input.testsTaken >= 1,
  },
  {
    id: "ten-tests",
    label: "Ten down",
    hint: "Complete 10 tests",
    earned: input.testsTaken >= 10,
  },
  {
    id: "streak-7",
    label: "7-day streak",
    hint: "Practise 7 days in a row",
    earned: input.longestStreak >= 7,
  },
  {
    id: "streak-30",
    label: "30-day streak",
    hint: "Practise 30 days in a row",
    earned: input.longestStreak >= 30,
  },
  {
    id: "score-80",
    label: "Distinction",
    hint: "Score 80% or higher",
    earned: input.bestScore >= 80,
  },
  {
    id: "consistent",
    label: "Consistent",
    hint: "Keep a 70% average",
    earned: input.averageScore >= 70 && input.testsTaken >= 5,
  },
];

/** Short, human nudge for the home hero. */
export const streakMessage = (streak: number, practisedToday: boolean) => {
  if (streak === 0) return "Start your streak with one quick test today.";
  if (!practisedToday) return `Keep your ${streak}-day streak alive — practise today.`;
  if (streak < 3) return "Nice. Come back tomorrow to build the habit.";
  if (streak < 7) return "You're building real momentum.";
  return "You're on fire. Top students practise like this.";
};

export const isToday = (dateStr?: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};
