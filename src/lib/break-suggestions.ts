export interface BreakActivity {
  id: string;
  title: string;
  description: string;
  iconName: 'stretch' | 'water' | 'eye' | 'breath' | 'walk' | 'tea';
  category: 'physical' | 'mindful' | 'hydration';
}

export const BREAK_SUGGESTIONS: BreakActivity[] = [
  {
    id: 'stretch',
    title: 'Gentle full-body stretch',
    description: 'Reach up high towards the ceiling, roll your shoulders back, and relieve back tension.',
    iconName: 'stretch',
    category: 'physical',
  },
  {
    id: 'water',
    title: 'Hydrate with fresh water',
    description: 'Pour a fresh glass of water. Proper hydration keeps your brain energized and alert.',
    iconName: 'water',
    category: 'hydration',
  },
  {
    id: 'eye-rest',
    title: '20-20-20 Eye relaxation',
    description: 'Look at something 20 feet (6 meters) away for 20 seconds to ease digital eye strain.',
    iconName: 'eye',
    category: 'mindful',
  },
  {
    id: 'deep-breathing',
    title: 'Calming box breathing',
    description: 'Inhale for 4 seconds, hold for 4, exhale for 4, and pause for 4. Repeat twice.',
    iconName: 'breath',
    category: 'mindful',
  },
  {
    id: 'walk',
    title: 'Short hallway walk',
    description: 'Stand up and step away from your desk. Stroll around your room or hallway to reset posture.',
    iconName: 'walk',
    category: 'physical',
  },
  {
    id: 'mindful-pause',
    title: 'Unplug and let your mind wander',
    description: 'Close your eyes, relax your jaw, and let thoughts settle without checking notifications.',
    iconName: 'breath',
    category: 'mindful',
  },
];

let lastIndex = -1;

export const getRandomBreakSuggestion = (): BreakActivity => {
  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * BREAK_SUGGESTIONS.length);
  } while (nextIndex === lastIndex && BREAK_SUGGESTIONS.length > 1);
  
  lastIndex = nextIndex;
  return BREAK_SUGGESTIONS[nextIndex];
};
