import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNames } from 'country-list';

// A simple component to handle hover and active states for list items
function ListItem({ name, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const style = {
    ...styles.listItem,
    backgroundColor: pressed ? '#E5E7EB' : hovered ? '#F9FAFB' : 'transparent',
    borderColor: hovered ? '#E5E7EB' : 'transparent',
  };

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <span style={styles.listItemText}>{name}</span>
    </button>
  );
}

export default function Home() {
  const countries = useMemo(() => getNames().sort(), []);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [aadhaar, setAadhaar] = useState(Array(12).fill(''));
  const inputRefs = useRef(Array(12).fill(null));
  const canContinue = !!selectedCountry && aadhaar.every((d) => d && d.length === 1);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.brand}>IIAI</div>
        <div style={styles.topRightNote}>Authorized Personal Only</div>
      </div>

      <div style={styles.center}>
        <button style={styles.dropdown} onClick={() => setPickerVisible(true)}>
          <span style={selectedCountry ? styles.dropdownText : styles.dropdownPlaceholder}>
            {selectedCountry ?? 'Select Country'}
          </span>
        </button>

        {selectedCountry && (
          <div style={styles.aadhaarContainer}>
            <div style={styles.aadhaarLabel}>Enter your Aadhar Card Number</div>
            <div style={styles.aadhaarRow}>
              {aadhaar.map((digit, idx) => {
                const isGroupGap = idx > 0 && idx % 4 === 0;
                return (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    style={{
                      ...styles.digitBox,
                      ...(isGroupGap ? styles.groupGap : {}),
                    }}
                    value={digit}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                      const next = [...aadhaar];
                      next[idx] = val;
                      setAadhaar(next);
                      if (val && idx < 11) {
                        inputRefs.current[idx + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !aadhaar[idx] && idx > 0) {
                        inputRefs.current[idx - 1]?.focus();
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {canContinue && (
          <Link to="/loading" style={styles.primaryButton}>
            <span style={styles.primaryButtonText}>Continue</span>
          </Link>
        )}
      </div>

      {pickerVisible && (
        <div style={styles.modalBackdrop} onClick={() => setPickerVisible(false)}>
          <div style={{...styles.modalCard, animation: 'slideIn 0.3s ease-out forwards'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Select Country</div>
            <div style={styles.list}>
              <div style={styles.listContent}>
                {countries.map((name) => (
                  <ListItem
                    key={name}
                    name={name}
                    onClick={() => {
                      setSelectedCountry(name);
                      setPickerVisible(false);
                    }}
                  />
                ))}
              </div>
            </div>
            <button style={styles.buttonSecondary} onClick={() => setPickerVisible(false)}>
              <span style={styles.buttonText}>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '16px',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: '700', color: '#111827' },
  topRightNote: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    width: 200,
    maxWidth: '90%',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    padding: '12px',
    backgroundColor: 'white',
    marginBottom: 12,
    cursor: 'pointer',
    textAlign: 'center'
  },
  dropdownText: { fontSize: 18, color: '#111827' },
  dropdownPlaceholder: { fontSize: 16, color: '#9CA3AF' },
  primaryButton: {
    backgroundColor: '#111827',
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  primaryButtonText: { color: 'white', fontWeight: '600' },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 10,
  },
  modalCard: {
    width: 360,
    maxWidth: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column'
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111827' },
  list: { maxHeight: 360, overflowY: 'auto' },
  listContent: { padding: '4px 0' },
  listItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 8px',
    borderRadius: 6,
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
  },
  listItemText: { fontSize: 16, color: '#111827' },
  buttonSecondary: {
    backgroundColor: '#374151',
    padding: '10px 16px',
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-end',
    border: 'none',
    cursor: 'pointer',
  },
  buttonText: { color: 'white', fontWeight: '600' },
  aadhaarContainer: {
    marginTop: 16,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  aadhaarLabel: { fontSize: 16, color: '#111827', marginBottom: 8, textAlign: 'center' },
  aadhaarRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' },
  digitBox: {
    width: 28,
    height: 36,
    border: '1px solid #D1D5DB',
    borderRadius: 6,
    margin: '0 4px',
    textAlign: 'center',
    fontSize: 18,
    color: '#111827',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  groupGap: { marginLeft: 14 },
};


const styleSheet = document.styleSheets[0];
if (styleSheet) {
    try {
        styleSheet.insertRule(`
            @keyframes slideIn {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `, styleSheet.cssRules.length);
    } catch (e) {
        console.error("Could not insert keyframes rule:", e);
    }
}


