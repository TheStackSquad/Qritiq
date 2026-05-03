// src/data/seedData.js
// Centralised seed data for trending components.
// Used as fallback when: server returns empty, component is in isolation,
// or the app is running without a backend (pitch/demo mode).
// Shape must stay in sync with the server response DTOs:
//   HypeRadarItem   → server/pkg/model/trending.go
//   VerdictSplitItem → server/pkg/model/trending.go

export const HYPE_RADAR_SEED = [
  {
    id: "1",
    title: "Gangs of Lagos 2",
    slug: "gangs-of-lagos-2",
    currentScore: 91.2,
    weeklyDelta: 14,
    totalVotes: 22100,
    status: "pre_release",
    genre: "Action/Crime",
  },
  {
    id: "2",
    title: "A Tribe Called Judah 2",
    slug: "a-tribe-called-judah-2",
    currentScore: 87.4,
    weeklyDelta: 8,
    totalVotes: 14200,
    status: "pre_release",
    genre: "Crime/Drama",
  },
  {
    id: "3",
    title: "Breath of Life",
    slug: "breath-of-life",
    currentScore: 82.1,
    weeklyDelta: 5,
    totalVotes: 11000,
    status: "pre_release",
    genre: "Historical",
  },
  {
    id: "4",
    title: "The Black Book 2",
    slug: "the-black-book-2",
    currentScore: 78.8,
    weeklyDelta: -6,
    totalVotes: 9800,
    status: "pre_release",
    genre: "Thriller",
  },
  {
    id: "5",
    title: "Mimi",
    slug: "mimi-2025",
    currentScore: 61.2,
    weeklyDelta: -3,
    totalVotes: 6200,
    status: "released",
    genre: "Romance",
  },
];

export const VERDICT_SPLIT_SEED = [
  {
    id: "1",
    title: "A Tribe Called Judah 2",
    slug: "a-tribe-called-judah-2",
    criticScore: 79,
    streetScore: 91,
    totalVotes: 14200,
    status: "pre_release",
  },
  {
    id: "2",
    title: "Gangs of Lagos 2",
    slug: "gangs-of-lagos-2",
    criticScore: 84,
    streetScore: 91,
    totalVotes: 22100,
    status: "pre_release",
  },
  {
    id: "3",
    title: "The Black Book 2",
    slug: "the-black-book-2",
    criticScore: 88,
    streetScore: 79,
    totalVotes: 9800,
    status: "pre_release",
  },
  {
    id: "4",
    title: "Mimi",
    slug: "mimi-2025",
    criticScore: 72,
    streetScore: 61,
    totalVotes: 6200,
    status: "released",
  },
  {
    id: "5",
    title: "Breath of Life",
    slug: "breath-of-life",
    criticScore: 91,
    streetScore: 82,
    totalVotes: 11000,
    status: "pre_release",
  },
];
