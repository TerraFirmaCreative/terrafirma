import { useEffect, useRef } from "react";

export function useInterval<TArgs extends any[]>(callback: (...args: any[]) => void, delay: number | null, ...args: TArgs) {
  const savedCallback = useRef<(...args: any[]) => void>();
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick(...args: TArgs) {
      if (savedCallback.current) {
        savedCallback.current(...args);
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay, ...args);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useTimeout<TArgs extends any[]>(callback: (...args: any[]) => void, delay: number | null, ...args: TArgs) {
  const savedCallback = useRef<(...args: any[]) => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setTimeout(tick, delay, ...args);
      return () => clearInterval(id);
    }
  }, [delay]);
}