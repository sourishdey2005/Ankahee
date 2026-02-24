import { Heart, Handshake, BrainCircuit, Zap } from 'lucide-react';

export const REACTIONS = {
    'Heart': {
        label: 'Love',
        icon: Heart,
        color: 'text-red-500',
        fill: 'fill-red-500'
    },
    'Support': {
        label: 'Support',
        icon: Handshake,
        color: 'text-blue-500',
        fill: 'fill-blue-500'
    },
    'Insight': {
        label: 'Insight',
        icon: BrainCircuit,
        color: 'text-purple-500',
        fill: 'fill-purple-500'
    },
    'Relatable': {
        label: 'Relatable',
        icon: Zap,
        color: 'text-yellow-500',
        fill: 'fill-yellow-500'
    }
} as const;

export type ReactionType = keyof typeof REACTIONS;
export const ReactionTypes = Object.keys(REACTIONS) as ReactionType[];
