import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * StaggeredText
 * Word-by-word staggered fade+slide reveal on scroll.
 */
export default function StaggeredText({
  text,
  as = 'span',
  className,
  style,
  duration = 5,
  y = 10,
  stagger = 4,
  delayChildren = 0.5,
  viewportAmount = 0.2,
  once = true,
}) {
  const prefersReducedMotion = useReducedMotion();

  const tokens = useMemo(() => {
    if (typeof text !== 'string') return [];
    // Keep spaces as tokens so spacing is preserved
    return text.split(/(\s+)/);
  }, [text]);

  if (prefersReducedMotion) {
    const Element = as;
    return (
      <Element className={className} style={style}>
        {text}
      </Element>
    );
  }

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };

  const word = {
    hidden: { opacity: 0, y },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
        // tiny organic jitter without breaking stagger ordering
        delay: (i % 7) * 0.01,
      },
    }),
  };

  const MotionElement = motion[as] ?? motion.span;

  let wordIndex = 0;

  return (
    <MotionElement
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: viewportAmount }}
    >
      {tokens.map((token, i) => {
        const isSpace = /^\s+$/.test(token);
        if (isSpace) {
          return <span key={`s-${i}`}>{token}</span>;
        }
        const idx = wordIndex++;
        return (
          <motion.span key={`w-${i}`} variants={word} custom={idx} style={{ display: 'inline-block' }}>
            {token}
          </motion.span>
        );
      })}
    </MotionElement>
  );
}


