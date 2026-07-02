// The moods Silky can tag a vent with. Each has a hand-drawn doodle (MoodDoodle.astro).
export const MOODS = [
  { key: 'happy',   label: 'happy',   emoji: '🙂' },
  { key: 'calm',    label: 'calm',    emoji: '😌' },
  { key: 'loved',   label: 'loved',   emoji: '🥰' },
  { key: 'hopeful', label: 'hopeful', emoji: '✨' },
  { key: 'meh',     label: 'meh',     emoji: '😐' },
  { key: 'sad',     label: 'sad',     emoji: '🙁' },
  { key: 'anxious', label: 'anxious', emoji: '😰' },
  { key: 'angry',   label: 'angry',   emoji: '😤' },
  { key: 'tired',   label: 'tired',   emoji: '😴' },
];

export const MOOD_LABEL = Object.fromEntries(MOODS.map((m) => [m.key, m.label]));
