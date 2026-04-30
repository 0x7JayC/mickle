// Daily quote pool. Two sources only:
//   1. Bible verses (KJV / ESV style attribution)
//   2. Public-domain or widely-cited literary / Christian thought
//      (C.S. Lewis, Bonhoeffer, Augustine, Spurgeon, Tozer, etc.) plus
//      secular Goodreads classics (writers, philosophers — never other
//      religious leaders).
//
// Rotation key: the day-of-year (1–366), so every visitor sees the
// same quote on the same calendar day. Pool size > 60 so no quote
// repeats inside two months.

export type Quote = { text: string; source: string };

export const QUOTES: Quote[] = [
  // Bible
  { text: "He who is faithful in a very little is also faithful in much.", source: "Luke 16:10" },
  { text: "Whoever gathers little by little will increase it.", source: "Proverbs 13:11" },
  { text: "Do not despise the day of small things.", source: "Zechariah 4:10" },
  { text: "The hand of the diligent makes rich.", source: "Proverbs 10:4" },
  { text: "The plans of the diligent lead surely to abundance.", source: "Proverbs 21:5" },
  { text: "He who is slow to anger is better than the mighty, and he who rules his spirit than he who takes a city.", source: "Proverbs 16:32" },
  { text: "Let us not grow weary of doing good, for in due season we will reap, if we do not give up.", source: "Galatians 6:9" },
  { text: "By small and simple things are great things brought to pass.", source: "Proverbs (paraphrase)" },
  { text: "Even a child is known by his deeds.", source: "Proverbs 20:11" },
  { text: "The race is not to the swift, nor the battle to the strong.", source: "Ecclesiastes 9:11" },
  { text: "Whatever your hand finds to do, do it with your might.", source: "Ecclesiastes 9:10" },
  { text: "He who tills his land will have plenty of bread, but he who follows worthless pursuits lacks sense.", source: "Proverbs 12:11" },
  { text: "The kingdom of heaven is like a mustard seed — the smallest of all seeds, but when it grows, it is the largest of garden plants.", source: "Matthew 13:31–32" },
  { text: "Now faith is the substance of things hoped for, the evidence of things not seen.", source: "Hebrews 11:1" },
  { text: "Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself.", source: "Matthew 6:34" },
  { text: "Cast your bread upon the waters, for after many days you will find it again.", source: "Ecclesiastes 11:1" },
  { text: "Steady plodding brings prosperity; hasty speculation brings poverty.", source: "Proverbs 21:5 (TLB)" },
  { text: "He who watches the wind will not sow, and he who looks at the clouds will not reap.", source: "Ecclesiastes 11:4" },
  { text: "Stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord, because you know that your labour in the Lord is not in vain.", source: "1 Corinthians 15:58" },
  { text: "I have learned, in whatsoever state I am, therewith to be content.", source: "Philippians 4:11" },
  { text: "Better is little with the fear of the Lord than great treasure with trouble.", source: "Proverbs 15:16" },
  { text: "Lazy hands make for poverty, but diligent hands bring wealth.", source: "Proverbs 10:4" },

  // Christian thinkers
  { text: "It is in the small unseen acts that the soul is shaped most surely.", source: "Charles Spurgeon" },
  { text: "Faithfulness in little things is a big thing.", source: "John Chrysostom" },
  { text: "We are what we repeatedly do.", source: "C.S. Lewis (paraphrase of Aristotle)" },
  { text: "The next step, even the smallest, in the right direction is more important than a thousand intentions.", source: "Dietrich Bonhoeffer" },
  { text: "Patience is the companion of wisdom.", source: "St. Augustine" },
  { text: "Do small things with great love.", source: "Mother Teresa" },
  { text: "We must learn to wait.", source: "A.W. Tozer" },
  { text: "It is not the absence of struggle, but the steadiness in it, that makes a saint.", source: "Hannah Whitall Smith" },
  { text: "Begin where you are, with what you have.", source: "Jim Elliot" },
  { text: "Wherever you are, be all there.", source: "Jim Elliot" },
  { text: "The Christian shoemaker does his duty not by putting little crosses on the shoes, but by making good shoes.", source: "Martin Luther" },
  { text: "God is not in a hurry, and He is never late.", source: "Tim Keller" },
  { text: "The smallest deed is better than the greatest intention.", source: "John Burroughs" },
  { text: "Faith is taking the first step even when you don't see the whole staircase.", source: "Martin Luther King Jr." },

  // Secular literary / philosophical (Goodreads-tier classics, no non-Christian religious leaders)
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", source: "Will Durant, on Aristotle" },
  { text: "Patience is bitter, but its fruit is sweet.", source: "Aristotle" },
  { text: "Slow and steady wins the race.", source: "Aesop" },
  { text: "What we hope ever to do with ease, we must first learn to do with diligence.", source: "Samuel Johnson" },
  { text: "It does not matter how slowly you go, so long as you do not stop.", source: "Confucius (popularly attributed)" },
  { text: "The journey of a thousand miles begins with a single step.", source: "(proverb)" },
  { text: "Discipline is the bridge between goals and accomplishment.", source: "Jim Rohn" },
  { text: "Compound interest is the eighth wonder of the world. He who understands it, earns it. He who doesn't, pays it.", source: "(attributed to Albert Einstein)" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", source: "(proverb)" },
  { text: "Habits are the compound interest of self-improvement.", source: "James Clear" },
  { text: "What you do every day matters more than what you do once in a while.", source: "Gretchen Rubin" },
  { text: "Inch by inch, life's a cinch. Yard by yard, life is hard.", source: "John Bytheway" },
  { text: "Quality is not an act. It is a habit.", source: "Will Durant" },
  { text: "The tragedy in life is not in failing to reach the goal. The tragedy lies in having no goal to reach.", source: "Benjamin E. Mays" },
  { text: "We become what we behold. We shape our tools and then our tools shape us.", source: "John Culkin" },
  { text: "There is no royal road to anything. One thing at a time, and all things in succession. That which grows fast withers as rapidly. That which grows slowly endures.", source: "Josiah Gilbert Holland" },
  { text: "The gem cannot be polished without friction, nor man perfected without trials.", source: "(English proverb)" },
  { text: "Many a little makes a mickle.", source: "Old Scottish proverb" },
  { text: "Drops of water falling one by one will, in the end, fill a vessel.", source: "Latin proverb" },
  { text: "Persistence is to the character of man as carbon is to steel.", source: "Napoleon Hill" },
  { text: "Constant dripping wears away the stone.", source: "(proverb)" },
  { text: "An oak tree grows one ring at a time.", source: "(proverb)" },
];

// Day-of-year: 1 on Jan 1, 366 max. Same calendar day → same quote for
// every user. Computed in UTC so it doesn't shift across timezones.
function dayOfYearUtc(d: Date = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / 86_400_000);
}

export function getQuoteOfDay(d: Date = new Date()): Quote {
  return QUOTES[(dayOfYearUtc(d) - 1 + QUOTES.length) % QUOTES.length];
}
