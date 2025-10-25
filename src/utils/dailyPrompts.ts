export const dailyPrompts = [
  "Our dream vacation",
  "How we met",
  "A perfect day together",
  "Our favorite memory",
  "If we were superheroes",
  "Cooking disaster",
  "Road trip adventure",
  "Childhood dreams",
  "Future plans",
  "Funny moment",
  "First date",
  "Rainy day story",
  "Magical adventure",
  "Time travel tale",
  "Unexpected surprise",
  "Pet adventure",
  "Holiday mishap",
  "Mystery to solve",
  "Dance party",
  "Secret treasure",
  "Beach day",
  "Mountain adventure",
  "City exploration",
  "Stargazing night",
  "Breakfast in bed",
  "Game night chaos",
  "Movie marathon",
  "Concert experience",
  "Festival fun",
  "Birthday surprise",
];

export function getTodayPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return dailyPrompts[dayOfYear % dailyPrompts.length];
}

export function getRandomPrompt(): string {
  return dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)];
}
