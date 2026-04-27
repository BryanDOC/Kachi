export function extractDominantColor(imgSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 60;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#3B82F6'); return; }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) {
          const a = data[i + 3];
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          if (a < 100) continue;
          if (pr > 235 && pg > 235 && pb > 235) continue; // skip near-white
          if (pr < 20 && pg < 20 && pb < 20) continue;   // skip near-black
          r += pr; g += pg; b += pb; count++;
        }

        if (count === 0) { resolve('#3B82F6'); return; }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        resolve('#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''));
      } catch {
        resolve('#3B82F6');
      }
    };
    img.onerror = () => resolve('#3B82F6');
    img.src = imgSrc;
  });
}
