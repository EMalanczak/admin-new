import { useState, useEffect, useRef, useCallback, MutableRefObject } from 'react';

export interface UseOnScreenParams<T> extends IntersectionObserverInit {
    elementRef: MutableRefObject<T>;
    repeatable?: boolean;
    initiallyVisible?: boolean;
}

type ReturnType = [boolean, IntersectionObserverEntry | undefined];

export const useOnScreen = <T extends HTMLElement = HTMLDivElement>({
    elementRef,
    threshold = 0.1,
    root = null,
    rootMargin = '0%',
    repeatable = false,
    initiallyVisible = false
}: UseOnScreenParams<T>): ReturnType => {
    const observer = useRef<IntersectionObserver | null>(null);
    // @ts-ignore
    const [entry, setEntry] = useState<IntersectionObserverEntry>();

    const isClient = typeof window !== `undefined`;
    const isSupported = isClient && 'IntersectionObserver' in window;
    const singleAnimaton = entry?.isIntersecting && !repeatable;
    const [isIntersecting, setIntersecting] = useState(!isSupported || initiallyVisible);

    const updateEntry = useCallback(([newEntry]: IntersectionObserverEntry[]): void => {
        setEntry(newEntry);
    }, []);

    useEffect(() => {
        if (!isSupported || singleAnimaton || !elementRef?.current) {
            return;
        }

        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(updateEntry, { threshold, root, rootMargin });

        const { current: currentObserver } = observer;

        currentObserver.observe(elementRef.current);

        // eslint-disable-next-line consistent-return
        return (): void => {
            currentObserver.disconnect();
        };
    }, [elementRef, threshold, root, rootMargin, singleAnimaton, isSupported]);

    useEffect(() => {
        if (!isIntersecting && !!entry?.isIntersecting) {
            setIntersecting(true);
        }
    }, [entry]);

    return [entry?.isIntersecting ?? initiallyVisible, entry];
};
