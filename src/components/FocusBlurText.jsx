import React, { useRef, useEffect } from 'react';

/**
 * FocusBlurText
 * Text that is sharp when vertically centered in the viewport,
 * and becomes progressively blurred as it moves away.
 */
export default function FocusBlurText({
    text,
    as: Component = 'span',
    style = {},
    className = '',
    maxBlur = 3, // Maximum blur in pixels
    spread = 1500, // Distance from center where blur reaches roughly 63%
}) {
    const ref = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const updateBlur = () => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const elementCenterY = rect.top + rect.height / 2;
            const viewportCenterY = window.innerHeight / 2;

            const distance = Math.abs(elementCenterY - viewportCenterY);

            // Calculate blur amount based on distance
            // Using an exponential decay curve for smoother transition implies:
            // more blur as distance increases.
            // Let's use a simple linear or quadratic mapping first, but clamped.
            // Actually, standard approach: blur = (distance / spread) * factor

            // Let's try a direct rational calculation
            const blurAmount = Math.min(maxBlur, (distance / window.innerHeight) * (maxBlur * 2.5));

            ref.current.style.filter = `blur(${blurAmount}px)`;
            ref.current.style.opacity = Math.max(0.3, 1 - (distance / window.innerHeight));

            animationFrameId = requestAnimationFrame(updateBlur);
        };

        // Start loop
        updateBlur();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [maxBlur, spread]);

    return (
        <Component ref={ref} className={className} style={{ ...style, transition: 'filter 0.1s linear, opacity 0.1s linear', willChange: 'filter, opacity' }}>
            {text}
        </Component>
    );
}
