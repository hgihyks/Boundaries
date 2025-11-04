import React, { useEffect, useMemo, useRef, useState } from 'react';
import StaggeredText from '../components/StaggeredText';
import { Link } from 'react-router-dom';

export default function Information() {
  const staticRows = useMemo(
    () => [
      ['Name', 'Aakriti Saparoo'],
      ['DOB', '21/02/2030'],
      ['Time of Birth', '04:17 AM'],
      ['Place of Birth', '17.6868° N, 83.2185° E'],
      ['Blood Group', 'B+'],
      ['Citizenship', 'Indian'],
      ['Religion', 'Born Hindu, now agnostic with interest in Jain philosophy'],
      ["Height", "5'7\""],
      ['Eyes', 'Hazel brown with flecks of green'],
      ['Temperament', 'Melancholic-Choleric'],
      ['PAN Card', 'MANPM4292J'],
      ['Aadhaar Card No.', '6591 2234 9087'],
      ['Driving License Number', 'KA01 2015 0049823'],
      ['Voter ID', 'YBT1234567'],
      ['Passport', 'M2083761'],
      ['Employee ID', '1289'],
      ['Bank Name', 'State Bank of India (SBI)'],
      ['Account Holder', 'Mahija Mandalika'],
      ['Account Number', '30569248123'],
      ['IFSC Code', 'SBIN0001445'],
      ['Internet Banking Username', 'mahija.sbi1995'],
      ['Internet Banking Password', 'fresh-apple-pies'],
      ['UPI ID', 'mahija@sbi'],
      ['UPI PIN', '4687'],
      ['Body Fat Percentage', '18.2%'],
      ['Muscle Mass Percentage', '41.6%'],
      ['Basal Metabolic Rate', '1325 kcal/day'],
      ['VO₂ Max', '46 ml/kg/min'],
      ['Alpha-Theta Synchrony (Rest State)', 'Above normal'],
      ['Gamma Spikes (during focus tasks)', 'Strong but irregular'],
    ],
    []
  );

  // Live counters (1/sec)
  const [rbc, setRbc] = useState('48057##');
  const [wbc, setWbc] = useState('630#');
  const [platelets, setPlatelets] = useState('2510##');
  const rbcTemplate = useRef('48057##');
  const wbcTemplate = useRef('630#');
  const plateletsTemplate = useRef('2510##');
  const [genomeSec, setGenomeSec] = useState(2); // last seconds digit in "Live Genome Age"

  useEffect(() => {
    const id = setInterval(() => {
      // replace hashes with random digits against the templates each tick
      const randDigit = () => Math.floor(Math.random() * 10).toString();
      setRbc(rbcTemplate.current.replace(/#/g, () => randDigit()));
      setWbc(wbcTemplate.current.replace(/#/g, () => randDigit()));
      setPlatelets(plateletsTemplate.current.replace(/#/g, () => randDigit()));
    }, 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setGenomeSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const liveRows = [
    ['Live RBC count (per µL)', rbc],
    ['Live WBC count (per µL)', wbc],
    ['Live Platelet count (per µL)', platelets],
    ['Live Genome Age', `2530722940 years, 4 months, ${genomeSec} seconds`],
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>LifeLine</h1>
        <div style={styles.grid}>
          {[...staticRows, ...liveRows].map(([label, value], idx) => (
            <div style={styles.row} key={idx}>
              <div style={styles.labelCol}>
                <StaggeredText as="span" style={styles.label} text={label} />
              </div>
              <div style={styles.valueCol}>
                <StaggeredText as="span" style={styles.value} text={String(value)} />
              </div>
            </div>
          ))}
        </div>
        <Link to="/choice" style={{ alignSelf: 'center' }}>
          <button style={styles.buttonPrimary}>
            <span style={styles.buttonText}>Boundaries</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  heading: {
    fontSize: '74px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '160px',
    marginTop: '40px',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
    width: '100%',
    maxWidth: '800px', // Or whatever max-width you prefer
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', // Adjusted gap for web
  },
  row: {
    padding: '14px 12px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed for better web layout
    backgroundColor: 'white',
  },
  labelCol: {
    marginRight: '12px',
  },
  valueCol: {},
  label: {
    fontWeight: '700',
    color: 'black',
    fontSize: '20px',
  },
  value: {
    color: 'black',
    fontSize: '20px',
    opacity: 0.8,
    textAlign: 'right', // Align values to the right
  },
  buttonPrimary: {
    alignSelf: 'center',
    backgroundColor: '#111827',
    padding: '200px 400px', // Adjusted padding
    borderRadius: '10px',
    marginTop: '150px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: '18px', // Added font size
  },
};


