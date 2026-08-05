import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Number that counts up on mount — makes stats feel alive without a library.
 */
export const CountUp = ({
  value,
  suffix = "",
  prefix = "",
  duration = 700,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) => {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span className={cn("tabular", className)}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

export default CountUp;
