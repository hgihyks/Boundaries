import React, { useEffect, useState } from 'react';
import { buildCombinedBlock } from '../utils/quotePicker';
export default function Thought2() {
  const [textBlock, setTextBlock] = useState('');

  const theThought = `Okay, please. Please calm down. How can.. do you kill. Had to training. Weapon. Knife. लेकिन व kitchen में है. Anything here? Chair? Sharp things? Pen? Pencil? Yes. Fuck. PENCIL.`

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tasks = Array.from({ length: 500 }, () => buildCombinedBlock(theThought));
        const blocks = await Promise.all(tasks);
        const appended = blocks.join('');
        if (mounted) setTextBlock(appended);
      } catch (e) {
        if (mounted) setTextBlock('');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [theThought]);

  return (
    <div style={styles.container}>
      {textBlock ? (
        <p style={styles.text}>{textBlock}</p>
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    padding: '0px',
    backgroundColor: '#f8f8f8'
  },
  text: {
    fontSize: '8px',
    lineHeight: '0.95',
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    color: '#111',
    margin: 0,
    textAlign: 'justify',
    whiteSpace: 'pre-wrap',
  },
};


