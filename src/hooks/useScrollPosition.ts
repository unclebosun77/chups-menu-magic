import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

export const useScrollPosition = (key?: string) => {
  const location = useLocation();
  const positionKey = key || location.pathname;
  const containerRef = useRef<HTMLDivElement>(null);

  // Save scroll position on unmount or route change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      scrollPositions.set(positionKey, container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      // Save final position on unmount
      if (container) {
        scrollPositions.set(positionKey, container.scrollTop);
      }
    };
  }, [positionKey]);

  // Restore scroll position on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const savedPosition = scrollPositions.get(positionKey);
    if (savedPosition !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        container.scrollTo({ top: savedPosition, behavior: "instant" });
      });
    }
  }, [positionKey]);

  return containerRef;
};

// Hook to save window scroll position
export const useWindowScrollPosition = (key?: string) => {
  const location = useLocation();
  const positionKey = key || location.pathname;

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(positionKey, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollPositions.set(positionKey, window.scrollY);
    };
  }, [positionKey]);

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = scrollPositions.get(positionKey);
    if (savedPosition !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedPosition, behavior: "instant" });
      });
    }
  }, [positionKey]);
};
