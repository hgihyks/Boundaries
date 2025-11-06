import React, { useEffect, useMemo, useState } from 'react';

export default function Present() {
  const [phase, setPhase] = useState('instruction'); // 'instruction' | 'words' | 'images'
  const words = useMemo(() => ['π', 'How', 'does', 'it', 'But', 'I', '9', '45', '32', '98', '104', 'Uhh', 'shtbtt', 'rrrrrr'], []);
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState('');

  // Load all images from src/images (non-recursive). Order is alphabetical by filename.
  const images = useMemo(() => {
    try {
      const ctx = require.context('../images', false, /\.(png|jpe?g|gif|svg)$/i);
      const paths = ctx.keys().sort();
      return paths.map((key) => ctx(key));
    } catch (e) {
      return [];
    }
  }, []);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (phase !== 'words') return;
    const current = words[wordIndex] || '';
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(current.slice(0, i));
      if (i >= current.length) clearInterval(id);
    }, 10);
    return () => clearInterval(id);
  }, [phase, wordIndex, words]);

  const atLastWord = wordIndex >= words.length - 1;
  const atLastImage = imageIndex >= Math.max(0, images.length - 1);

  return (
    <div style={styles.page}>
      {phase === 'instruction' ? (
        <div style={styles.centerWrap}>
          <div style={styles.instructions}>
            <p style={styles.instructionText}>Whenever you're ready,</p>
            <p style={styles.instructionText}>close your eyes and press this button.</p>
            <p style={styles.instructionText}> Think of a number.</p>
            <p style={styles.instructionText}>When you have it, open your eyes.</p>
          </div>
          <button
            style={styles.primaryButton}
            onClick={() => {
              setPhase('words');
              setWordIndex(0);
              setImageIndex(0);
            }}
          >
            <span style={styles.primaryButtonText}>Continue</span>
          </button>
        </div>
      ) : phase === 'words' ? (
        <div style={styles.wordsWrap}>
          <div style={styles.wordBox}>
            <span style={styles.wordText}>{typed}</span>
          </div>
          <div style={styles.bottomBar}>
            <button
              style={{
                ...styles.nextButton,
                ...(words.length === 0 ? styles.nextButtonDisabled : null),
              }}
              onClick={() => {
                if (words.length === 0) return;
                if (!atLastWord) {
                  setWordIndex(wordIndex + 1);
                } else {
                  // Move to images phase once words are done
                  setPhase('images');
                }
              }}
              disabled={words.length === 0}
            >
              <span style={styles.nextButtonText}>{atLastWord ? 'Next' : 'Next'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.wordsWrap}>
          <div style={styles.imageBox}>
            {images.length > 0 ? (
              <img
                src={images[imageIndex]}
                alt={`Slide ${imageIndex + 1}`}
                style={styles.image}
              />
            ) : (
              <span style={styles.wordText}>No images found in src/images</span>
            )}
          </div>
          <div style={styles.bottomBar}>
            <button
              style={{
                ...styles.nextButton,
                ...(images.length === 0 || atLastImage ? styles.nextButtonDisabled : null),
              }}
              onClick={() => {
                if (images.length === 0) return;
                if (!atLastImage) {
                  setImageIndex(imageIndex + 1);
                }
              }}
              disabled={images.length === 0 || atLastImage}
            >
              <span style={styles.nextButtonText}>{atLastImage ? 'Done' : 'Next'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: 16 },
  centerWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: '400px' },
  instructions: { maxWidth: 720, width: '100%', textAlign: 'center', padding: '0 8px' },
  instructionText: { fontSize: 'clamp(18px, 3.4vw, 26px)', lineHeight: 1.5, margin: 0 },
  primaryButton: { backgroundColor: '#111827', padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer' },
  primaryButtonText: { color: 'white', fontWeight: 600, fontSize: 'clamp(14px, 2.8vw, 18px)' },

  wordsWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  wordBox: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', width: '100%' },
  wordText: { fontSize: 'clamp(48px, 15vw, 148px)', fontWeight: 700, letterSpacing: 1, },
  imageBox: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', width: '100%' },
  image: { maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, objectFit: 'contain' },

  bottomBar: { position: 'sticky', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center', padding: '16px 16px calc(16px + env(safe-area-inset-bottom))' },
  nextButton: { backgroundColor: '#111827', padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer' },
  nextButtonDisabled: { backgroundColor: '#4B5563', cursor: 'not-allowed' },
  nextButtonText: { color: 'white', fontWeight: 600, fontSize: 'clamp(14px, 2.8vw, 18px)' },
};

