'use client'

import React, { useState, useEffect, useMemo } from 'react';
import WordCloud from 'react-wordcloud';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BrainCircuit } from 'lucide-react';

type WordCloudData = {
  text: string;
  value: number;
};

export default function CommunityWordCloud({ data }: { data: WordCloudData[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Ensure the font is loaded before rendering the word cloud to prevent measurement errors.
    document.fonts.load('bold 1rem "Space Grotesk"').then(() => {
        setIsFontLoaded(true);
    });
  }, []);

  const colors = useMemo(() => [
    '#FF9933', // primary
    '#A162F7', // purpleish
    '#F2C94C', // yellow
    '#EB5757', // red
    '#2D9CDB', // blue
    '#6FCF97'  // green
  ], []);

  if (data.length === 0) {
    return null;
  }
  
  const options: any = {
    colors,
    fontFamily: '"Space Grotesk", sans-serif',
    fontSizes: [18, 64],
    fontStyle: 'normal',
    fontWeight: 'bold',
    padding: 1,
    rotations: 0,
    rotationAngles: [0, 0],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000,
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <BrainCircuit className="h-6 w-6 text-primary" />
          Community Pulse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
            {isMounted && isFontLoaded ? (
                <WordCloud
                    words={data}
                    options={options}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Loading word cloud...
                </div>
            )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">A snapshot of the most-used words in the last 24 hours.</p>
      </CardContent>
    </Card>
  );
}
