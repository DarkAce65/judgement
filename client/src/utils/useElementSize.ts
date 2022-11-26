import { RefObject, useLayoutEffect, useState } from 'react';

type ResizeObserverCallback = (entry: ResizeObserverEntry, resizeObserver: ResizeObserver) => void;

class ResizeObserverManager {
  private resizeObserver: ResizeObserver;
  private callbacks: Map<Element, ResizeObserverCallback[]>;

  constructor() {
    let didQueueEntries = false;
    let entriesToProcess: ResizeObserverEntry[] = [];

    this.resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        entriesToProcess = entriesToProcess.concat(entries);
        if (!didQueueEntries) {
          requestAnimationFrame(() => {
            const processedElements = new Set<Element>();
            for (let i = 0; i < entriesToProcess.length; i++) {
              if (processedElements.has(entriesToProcess[i].target)) continue;
              processedElements.add(entriesToProcess[i].target);

              this.callbacks
                .get(entriesToProcess[i].target)
                ?.forEach((callback) => callback(entriesToProcess[i], observer));
            }
            entriesToProcess = [];
            didQueueEntries = false;
          });
        }
        didQueueEntries = true;
      }
    );
    this.callbacks = new Map();
  }

  subscribe(target: Element, callback: ResizeObserverCallback): void {
    this.resizeObserver.observe(target);
    const callbacks = this.callbacks.get(target) ?? [];
    callbacks.push(callback);
    this.callbacks.set(target, callbacks);
  }

  unsubscribe(target: Element, callback: ResizeObserverCallback): void {
    if (!this.callbacks.has(target)) return;

    const callbacks = this.callbacks.get(target)!;
    if (callbacks.length === 1) {
      this.resizeObserver.unobserve(target);
      this.callbacks.delete(target);
      return;
    }
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    this.callbacks.set(target, callbacks);
  }
}

let resizeObserverManager: ResizeObserverManager;
const getResizeObserverManager = () =>
  !resizeObserverManager
    ? (resizeObserverManager = new ResizeObserverManager())
    : resizeObserverManager;

const useElementSize = <T extends Element>(
  element: RefObject<T> | T | null
): { height: number; width: number } => {
  const observer = getResizeObserverManager();

  const [size, setSize] = useState({ height: 0, width: 0 });

  useLayoutEffect(() => {
    const elementToObserve = element && 'current' in element ? element.current : element;
    if (!elementToObserve) return;

    setSize(elementToObserve.getBoundingClientRect());
  }, [element]);

  useLayoutEffect(() => {
    const elementToObserve = element && 'current' in element ? element.current : element;
    if (!elementToObserve) return;

    let isSubscribed = true;
    const callback = (entry: ResizeObserverEntry) => {
      if (!isSubscribed) return;
      setSize(entry.contentRect);
    };
    observer.subscribe(elementToObserve, callback);

    return () => {
      isSubscribed = false;
      observer.unsubscribe(elementToObserve, callback);
    };
  }, [element, observer]);

  return size;
};

export default useElementSize;
