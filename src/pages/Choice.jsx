import React from 'react';
import { Link } from 'react-router-dom';

export default function Choice() {
  return (
    <div style={styles.safeArea}>
      <div style={styles.header}>
        <div style={styles.title}>Boundaries</div>
      </div>
      <div style={styles.centerContent}>
        <div style={styles.row}>
          <Link to="/past"><button className="choice-button"><span className="button-text">Past</span></button></Link>
          <Link to="/present"><button className="choice-button"><span className="button-text">Present</span></button></Link>
          <Link to="/future"><button className="choice-button"><span className="button-text">Future</span></button></Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  safeArea: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { alignItems: 'center', paddingLeft: 16, paddingRight: 16, display: 'flex', justifyContent: 'center' },
  centerContent: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 48, fontWeight: 800, marginBottom: 16, textAlign: 'center', marginTop: 20 },
  row: { display: 'flex', flexDirection: 'row', gap: 440, marginBottom: 0, flexWrap: 'wrap', justifyContent: 'center' },
};


