export type Parable = { day: number; text: string; source?: string };

export const PARABLES: Parable[] = [
  { day: 1, text: "He who is faithful with little will be faithful with much.", source: "Luke 16:10" },
  { day: 2, text: "Compound interest is the eighth wonder of the world. He who understands it, earns it.", source: "—" },
  { day: 3, text: "The tortoise wins. Quietly. Every time.", source: "Aesop" },
  { day: 4, text: "Wealth gained hastily will dwindle. But whoever gathers little by little will increase it.", source: "Proverbs 13:11" },
  { day: 5, text: "It is not the strongest who survive, but the most consistent.", source: "—" },
  { day: 6, text: "A small leak will sink a great ship. The opposite is also true: a small drop, every day, fills the well.", source: "—" },
  { day: 7, text: "One week. The hardest part is now behind you.", source: "—" },
  { day: 8, text: "Do not despise the day of small beginnings.", source: "Zechariah 4:10" },
  { day: 9, text: "Diligent hands will rule. Lazy ones will end up serving them.", source: "Proverbs 12:24" },
  { day: 10, text: "Ten days. You are no longer experimenting. You are practicing.", source: "—" },
  { day: 11, text: "An oak tree grows one ring at a time. There is no fast version.", source: "—" },
  { day: 12, text: "Habit is the daughter of repetition.", source: "—" },
  { day: 13, text: "What you do every day matters more than what you do once in a while.", source: "Gretchen Rubin" },
  { day: 14, text: "Two weeks. The doubt is quieter now. Stay.", source: "—" },
  { day: 15, text: "The mustard seed is the smallest of seeds. And yet.", source: "Matthew 13:31" },
  { day: 16, text: "Patience is bitter but its fruit is sweet.", source: "Aristotle" },
  { day: 17, text: "It is in the small unseen acts that the soul is shaped most surely.", source: "Charles Spurgeon" },
  { day: 18, text: "By small and simple things are great things brought to pass.", source: "—" },
  { day: 19, text: "If you are faithful in small matters, you will be faithful in large ones.", source: "Luke 16:10" },
  { day: 20, text: "Twenty days. A streak you would have called a fluke is becoming an identity.", source: "—" },
  { day: 21, text: "It takes courage to be quiet.", source: "—" },
  { day: 22, text: "The grass is greener where you water it.", source: "—" },
  { day: 23, text: "Do small things with great love.", source: "Mother Teresa" },
  { day: 24, text: "Money grows on the tree of persistence.", source: "Japanese proverb" },
  { day: 25, text: "Quarter of a hundred. The compounding is beginning to bend.", source: "—" },
  { day: 26, text: "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.", source: "Proverbs 16:32" },
  { day: 27, text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", source: "Will Durant on Aristotle" },
  { day: 28, text: "Four weeks. You have made a decision into a default.", source: "—" },
  { day: 29, text: "Many a little makes a mickle.", source: "Old English proverb" },
  { day: 30, text: "Thirty days. You are no longer the person who started this.", source: "—" },
];

export function getTodaysParable(streak: number): Parable {
  const idx = ((streak - 1) % PARABLES.length + PARABLES.length) % PARABLES.length;
  return PARABLES[idx];
}
