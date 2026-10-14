import { useEffect, useState } from "react";

/** counts up every `intervalMs` while the component is mounted; drives the demo animations */
export function useTick(intervalMs: number): number {
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setTick((current: number) => current + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return tick;
}
