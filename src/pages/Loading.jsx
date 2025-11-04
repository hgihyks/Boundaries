import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Loading() {
  const lines = useMemo(
    () => [
      'Accessing Government Repositories',
      'Accessing Private Repositories',
      'Calculating Genetic History',
      'Initiating 128000000 qubits',
    ],
    []
  );

  const [visibleCount, setVisibleCount] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (visibleCount <= lines.length) {
      const timer = setTimeout(() => {
        setVisibleCount((c) => c + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, lines.length]);
  
  const allShown = visibleCount > lines.length;

  useEffect(() => {
    if (allShown) {
      setIsButtonLoading(true);
      const timer = setTimeout(() => {
        setIsButtonLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allShown]);

  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        {lines.slice(0, visibleCount).map((text, idx) => (
          <div key={idx} style={styles.line}>
            {text}
          </div>
        ))}
      </div>

      {allShown && (
        <button
          style={{
            ...styles.button,
            ...(isButtonLoading ? styles.buttonLoading : styles.buttonReady),
          }}
          onClick={() => navigate('/information')}
        >
          {isButtonLoading ? (
            <span style={styles.spinner} aria-label="Loading" />
          ) : (
            <span style={styles.buttonText}>LifeLine</span>
          )}
        </button>
      )}

      {!allShown && <div style={styles.subtle}>Please wait…</div>}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBottom: '16px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    fontSize: '18px',
    color: '#111827',
    textAlign: 'center',
    animation: 'fadeInUp 0.35s ease-out forwards',
  },
  button: {
    backgroundColor: '#111827',
    padding: '10px 16px',
    borderRadius: '8px',
    marginTop: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonLoading: {
    animation: 'padExpand 2s ease-in-out forwards',
  },
  buttonReady: {
    padding: '10px 1000px',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  subtle: {
    color: '#6B7280',
    marginTop: '8px',
  },
};

// It's cleaner to add keyframes to index.css, but for component-specific styles, this works.
const styleSheet = document.styleSheets[0];
if (styleSheet) {
    try {
        styleSheet.insertRule(`
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(12px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `, styleSheet.cssRules.length);
        styleSheet.insertRule(`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `, styleSheet.cssRules.length);
        styleSheet.insertRule(`
            @keyframes padExpand {
                from { padding: 10px 16px; }
                to { padding: 10px 1600px; }
            }
        `, styleSheet.cssRules.length);
    } catch (e) {
        console.error("Could not insert keyframes rule:", e);
    }
}


