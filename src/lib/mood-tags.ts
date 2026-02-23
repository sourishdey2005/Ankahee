export const MoodTags = ['Sad', 'Angry', 'Love', 'Anxiety', 'Secret'] as const;
export type MoodTag = typeof MoodTags[number];

export const moodColors: { [key: string]: string } = {
  'Sad': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Angry': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Love': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Anxiety': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Secret': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};
