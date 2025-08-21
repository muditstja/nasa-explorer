import { useEffect, useState } from 'react';

/** ResizeObserver + devicePixelRatio aware canvas sizing. */
export function useCanvasSize(canvas: HTMLCanvasElement | null) {
  const [size, setSize] = useState({ w: 0, h: 0, ratio: 1 });

  useEffect(() => {
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const r = Math.min(2, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      canvas.width = Math.floor(box.width * r);
      canvas.height = Math.floor(box.height * r);
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      setSize({ w: box.width, h: box.height, ratio: r });
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvas]);

  return size;
}
