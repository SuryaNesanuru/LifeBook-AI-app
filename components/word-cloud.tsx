'use client';

import { useEffect, useRef } from 'react';

interface WordCloudProps {
  words: Array<{
    word: string;
    count: number;
  }>;
}

export function WordCloudComponent({ words }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(words) || words.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxCount = Math.max(...words.map(w => w.count));
    const minCount = Math.min(...words.map(w => w.count));
    const fontSizeRange = { min: 12, max: 36 };

    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
    ];

    const positions: Array<{ x: number; y: number; width: number; height: number }> = [];

    words.slice(0, 15).forEach((word, index) => {
      const fontSize =
        maxCount === minCount
          ? fontSizeRange.max
          : Math.round(
              fontSizeRange.min +
                ((word.count - minCount) / (maxCount - minCount)) *
                  (fontSizeRange.max - fontSizeRange.min)
            );

      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = colors[index % colors.length];

      const metrics = ctx.measureText(word.word);
      const width = metrics.width;
      const height = fontSize;

      let x = Math.random() * (canvas.width - width);
      let y = Math.random() * (canvas.height - height) + height;

      let attempts = 0;
      while (attempts < 10) {
        const overlaps = positions.some(
          pos =>
            x < pos.x + pos.width &&
            x + width > pos.x &&
            y < pos.y + pos.height &&
            y + height > pos.y
        );

        if (!overlaps) break;

        x = Math.random() * (canvas.width - width);
        y = Math.random() * (canvas.height - height) + height;
        attempts++;
      }

      positions.push({ x, y, width, height });
      ctx.fillText(word.word, x, y);
    });
  }, [words]);

  if (!Array.isArray(words) || words.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No words to display yet. Keep writing!</p>
      </div>
    );
  }

  return (
    <div className="wordcloud-container">
      <canvas ref={canvasRef} className="w-full h-48" />
    </div>
  );
}
