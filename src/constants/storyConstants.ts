import { StoryTheme, StoryMode, StoryTemplate, Reaction } from "../types/story";

// Theme definitions with colors and descriptions
export const THEMES: Record<StoryTheme, { color: string; gradient: string[]; description: string }> = {
  romance: {
    color: "#D4A5A5",
    gradient: ["#FFC5D9", "#FFE5EC"],
    description: "Love stories and heartfelt moments"
  },
  adventure: {
    color: "#85B79D",
    gradient: ["#A7D7C5", "#D4EDE1"],
    description: "Epic journeys and discoveries"
  },
  comedy: {
    color: "#F9C74F",
    gradient: ["#FFD97D", "#FFF4D6"],
    description: "Laugh-out-loud funny tales"
  },
  mystery: {
    color: "#6A4C93",
    gradient: ["#9B8FC2", "#D4C9E8"],
    description: "Suspenseful whodunits"
  },
  fantasy: {
    color: "#B084CC",
    gradient: ["#D4B5E8", "#F0E5FF"],
    description: "Magical worlds and creatures"
  },
  scifi: {
    color: "#4A90A4",
    gradient: ["#7DB9CC", "#C5E3EC"],
    description: "Future tech and space"
  },
  horror: {
    color: "#8B4C4C",
    gradient: ["#B87E7E", "#E8C5C5"],
    description: "Spooky and thrilling"
  },
  "slice-of-life": {
    color: "#A8DADC",
    gradient: ["#C5E9EB", "#E8F7F8"],
    description: "Everyday beautiful moments"
  }
};

// Mode definitions
export const MODES: Record<StoryMode, { words: number; description: string; icon: string }> = {
  quick: {
    words: 25,
    description: "Quick 5-minute story",
    icon: "⚡"
  },
  standard: {
    words: 75,
    description: "Classic WordChain experience",
    icon: "📖"
  },
  epic: {
    words: 150,
    description: "Long-form storytelling",
    icon: "🏆"
  },
  sentence: {
    words: 20,
    description: "Take turns with full sentences",
    icon: "💬"
  }
};

// Story templates organized by theme
export const STORY_TEMPLATES: StoryTemplate[] = [
  // Romance (Free)
  { id: "rom1", title: "First Date", theme: "romance", prompt: "Our first date was unforgettable because...", isPremium: false },
  { id: "rom2", title: "Love Letter", theme: "romance", prompt: "The moment I knew I loved you...", isPremium: false },
  { id: "rom3", title: "Dream Wedding", theme: "romance", prompt: "In our perfect wedding...", isPremium: true },
  { id: "rom4", title: "Anniversary", theme: "romance", prompt: "Looking back on our year together...", isPremium: true },

  // Adventure (Premium)
  { id: "adv1", title: "Lost Island", theme: "adventure", prompt: "We discovered a mysterious island where...", isPremium: true },
  { id: "adv2", title: "Road Trip", theme: "adventure", prompt: "Our epic road trip began when...", isPremium: false },
  { id: "adv3", title: "Time Travel", theme: "adventure", prompt: "The time machine activated and...", isPremium: true },

  // Comedy (Mix)
  { id: "com1", title: "Cooking Disaster", theme: "comedy", prompt: "Our cooking attempt went hilariously wrong when...", isPremium: false },
  { id: "com2", title: "Pet Chaos", theme: "comedy", prompt: "Our pet did the funniest thing today...", isPremium: true },
  { id: "com3", title: "Awkward Moment", theme: "comedy", prompt: "The most awkward thing happened...", isPremium: false },

  // Mystery (Premium)
  { id: "mys1", title: "Missing Item", theme: "mystery", prompt: "Something precious went missing and...", isPremium: true },
  { id: "mys2", title: "Secret Door", theme: "mystery", prompt: "We found a hidden door that led to...", isPremium: true },
  { id: "mys3", title: "Anonymous Gift", theme: "mystery", prompt: "A mysterious package arrived with...", isPremium: true },

  // Fantasy (Premium)
  { id: "fan1", title: "Magic Powers", theme: "fantasy", prompt: "We woke up with magical abilities...", isPremium: true },
  { id: "fan2", title: "Enchanted Forest", theme: "fantasy", prompt: "Deep in the enchanted forest we found...", isPremium: true },
  { id: "fan3", title: "Dragon Encounter", theme: "fantasy", prompt: "The dragon landed before us and...", isPremium: true },

  // Sci-Fi (Premium)
  { id: "sci1", title: "Space Station", theme: "scifi", prompt: "Life on the space station changed when...", isPremium: true },
  { id: "sci2", title: "AI Companion", theme: "scifi", prompt: "Our robot companion suddenly...", isPremium: true },
  { id: "sci3", title: "Parallel Universe", theme: "scifi", prompt: "We crossed into a parallel world where...", isPremium: true },

  // Horror (Premium)
  { id: "hor1", title: "Haunted House", theme: "horror", prompt: "The old house was not empty because...", isPremium: true },
  { id: "hor2", title: "Strange Noise", theme: "horror", prompt: "At midnight we heard a sound that...", isPremium: true },

  // Slice of Life (Free)
  { id: "sol1", title: "Sunday Morning", theme: "slice-of-life", prompt: "Our perfect lazy Sunday morning...", isPremium: false },
  { id: "sol2", title: "Coffee Date", theme: "slice-of-life", prompt: "Over coffee we talked about...", isPremium: false },
  { id: "sol3", title: "Rainy Day", theme: "slice-of-life", prompt: "On this cozy rainy afternoon...", isPremium: false },
];

// Reaction emojis
export const REACTIONS: Reaction[] = [
  { emoji: "❤️", label: "Love it" },
  { emoji: "😂", label: "Hilarious" },
  { emoji: "😍", label: "So sweet" },
  { emoji: "🥰", label: "Adorable" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "✨", label: "Magical" },
  { emoji: "🎉", label: "Amazing" },
  { emoji: "💯", label: "Perfect" },
  { emoji: "🤩", label: "Wow" },
  { emoji: "💕", label: "Hearts" },
];

// Premium features list
export const PREMIUM_FEATURES = {
  unlimitedStories: "Unlimited active stories (Free: 3)",
  premiumThemes: "All 8 themes unlocked",
  premiumTemplates: "50+ premium story templates",
  voiceInput: "Voice recording for words",
  customTags: "Organize with custom tags",
  advancedModes: "Epic & Sentence modes",
  streakTracking: "Track your writing streaks",
};

// Free tier limits
export const FREE_LIMITS = {
  maxActiveStories: 3,
  canUseVoice: false,
  availableThemes: ["romance", "comedy", "slice-of-life"] as StoryTheme[],
  availableModes: ["quick", "standard"] as StoryMode[],
};
