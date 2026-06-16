export const QUOTES: { text: string; author: string }[] = [
  { text: "Small daily improvements are the key to staggering long-term results.", author: "James Clear" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Will Durant" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "Showing up bare minimum still beats not showing up at all.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "A river cuts through rock not because of its power, but its persistence.", author: "Jim Watkins" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Today's a good day to be a little better than yesterday.", author: "Unknown" },
  { text: "Slow progress is still progress. Be proud of every step.", author: "Unknown" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "On your busiest days, the bare minimum is still a victory.", author: "Unknown" },
  { text: "The grass doesn't grow faster by pulling it. Trust the process.", author: "Unknown" },
  { text: "Be the energy you want to attract.", author: "Unknown" },
  { text: "Rest is not a reward for finishing. It's a requirement for continuing.", author: "Unknown" },
  { text: "One percent better every day adds up to remarkable.", author: "James Clear" },
  { text: "Your future self is watching you right now through your habits.", author: "Unknown" },
  { text: "Water your roots before you chase the bloom.", author: "Unknown" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "The bend in the road is not the end of the road, unless you fail to make the turn.", author: "Unknown" },
  { text: "Each habit you keep today is a gift to your future self.", author: "Unknown" },
  { text: "Joy is found in the doing, not just the finishing.", author: "Unknown" },
  { text: "Tiny seeds, watered daily, grow into forests.", author: "Unknown" },
  { text: "Even half effort on a hard day is full courage.", author: "Unknown" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
];

export function getTodayQuote(): { text: string; author: string } {
  const start = new Date(2025, 0, 1).getTime();
  const now = Date.now();
  const dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const idx = ((dayIndex % QUOTES.length) + QUOTES.length) % QUOTES.length;
  return QUOTES[idx];
}
