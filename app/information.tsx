import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function InformationScreen() {
  // Base values
  const staticRows = useMemo(() => ([
    ['Name', 'Mahija Mandalika'],
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
  ]), []);

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
      setGenomeSec((s) => (s + 1));
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>LifeLine</Text>
        <View style={styles.grid}>
          {[...staticRows, ...liveRows].map(([label, value], idx) => (
            <View style={styles.row} key={idx}>
              <View style={styles.labelCol}>
                <Text style={styles.label}>{label}</Text>
              </View>
              <View style={styles.valueCol}>
                <Text style={styles.value}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
        <Link href="/choice" asChild>
          <Pressable style={styles.buttonPrimary}>
            <Text style={styles.buttonText}>Boundaries</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  heading: {
    fontSize: 74,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 160,
    marginTop: 80,
    textAlign: 'center', // or 'left' if you prefer
  },
  
  content: { padding: 16, gap: 36 },
  grid: { gap: 120 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  labelCol: { flexShrink: 1, marginRight: 12 },
  valueCol: { flexShrink: 1 },
  label: { fontWeight: '700', color: '#374151', fontSize: 20 },
  value: { color: 'black', fontSize: 20, opacity: 0.7 },
  buttonPrimary: { alignSelf: 'center', backgroundColor: '#111827', paddingVertical: 120, paddingHorizontal: 200, borderRadius: 10, marginTop: 150 },
  buttonText: { color: 'white', fontWeight: '600' },
});


