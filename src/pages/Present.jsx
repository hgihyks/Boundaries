import React from 'react';
import { Link } from 'react-router-dom';

export default function Present() {
  return (
    <div style={styles.container}>
      <div style={styles.title}>Present</div>
      <div style={styles.subtitle}>The here and now.</div>
      <Link to="/choice"><button style={styles.buttonSecondary}><span style={styles.buttonText}>Back</span></button></Link>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, flexDirection: 'column' },
  title: { fontSize: 24, fontWeight: 600, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  button: { backgroundColor: '#111827', padding: '10px 16px', borderRadius: 8, marginTop: 8, border: 'none', cursor: 'pointer' },
  buttonSecondary: { backgroundColor: '#374151', padding: '10px 16px', borderRadius: 8, marginTop: 8, border: 'none', cursor: 'pointer' },
  buttonText: { color: 'white', fontWeight: 600 },
};


