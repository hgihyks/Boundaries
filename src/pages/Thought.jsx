import React, { useEffect, useState } from 'react';
import { buildCombinedBlock } from '../utils/quotePicker';
export default function Thought() {
  const [textBlock, setTextBlock] = useState('');

const theThought = `
I don't even know any one in this city. Why would I need a pepper spray here mama, this is such a small, cute town. I'm not whispering.  And anyways I have a pencil. Tum hi ne bataya tha na ki John Wick killed 3 people with a pencil.  See, I'm in my bedroom and my stalker is not here. Yayy!!  Let me set it up first, fir dikhaungi. All of my thoughts... ever`
  
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
    lineHeight: '0.9',
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    color: '#111',
    margin: 0,
    textAlign: 'justify',
    whiteSpace: 'pre-wrap',
  },
};


