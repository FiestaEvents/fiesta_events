// src/common/CountUp.jsx
import React, { useEffect, useState } from 'react';

const CountUp = ({ end, duration = 2, decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof end !== 'number' || end < 0) return;

    const start = 0;
    const totalDuration = duration * 1000; // convert seconds to ms
    const startTime = performance.now();
    const target = end;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      // Optional: add easing (e.g. ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const currentValue = easedProgress * target;

      setCount(Number(currentValue.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, decimals]);

  // Format number with commas
  const formattedCount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return <span>{formattedCount}</span>;
};

export { CountUp };