import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { getNames } from 'country-list';

export default function HomeScreen() {
  const countries = useMemo(() => getNames().sort(), []);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [aadhaar, setAadhaar] = useState<string[]>(Array(12).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(12).fill(null));
  const canContinue = !!selectedCountry && aadhaar.every((d) => d && d.length === 1);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>IIAI</Text>
        <Text style={styles.topRightNote}>Authorized Personal Only</Text>
      </View>

      <View style={styles.center}>
        <Pressable style={styles.dropdown} onPress={() => setPickerVisible(true)}>
          <Text style={selectedCountry ? styles.dropdownText : styles.dropdownPlaceholder}>
            {selectedCountry ?? 'Select Country'}
          </Text>
        </Pressable>
        {selectedCountry && (
          <View style={styles.aadhaarContainer}>
            <Text style={styles.aadhaarLabel}>Enter your Aadhar Card Number</Text>
            <View style={styles.aadhaarRow}>
              {aadhaar.map((digit, idx) => {
                const isGroupGap = idx > 0 && idx % 4 === 0;
                return (
                  <TextInput
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    style={[styles.digitBox, isGroupGap ? styles.groupGap : null]}
                    value={digit}
                    keyboardType="number-pad"
                    maxLength={1}
                    returnKeyType={idx === 11 ? 'done' : 'next'}
                    onChangeText={(t) => {
                      const val = t.replace(/\D/g, '').slice(0, 1);
                      const next = [...aadhaar];
                      next[idx] = val;
                      setAadhaar(next);
                      if (val && idx < 11) {
                        inputRefs.current[idx + 1]?.focus();
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !aadhaar[idx] && idx > 0) {
                        inputRefs.current[idx - 1]?.focus();
                      }
                    }}
                  />
                );
              })}
            </View>
          </View>
        )}
        {canContinue && (
          <Link href="/loading" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </Link>
        )}
      </View>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {countries.map((name: string) => (
                <Pressable
                  key={name}
                  style={(s) => ({
                    ...styles.listItem,
                    backgroundColor: (s as any).pressed ? '#E5E7EB' : (s as any).hovered ? '#F9FAFB' : 'transparent',
                    borderColor: (s as any).hovered ? '#E5E7EB' : 'transparent',
                  })}
                  onPress={() => {
                    setSelectedCountry(name);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.listItemText}>{name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.buttonSecondary} onPress={() => setPickerVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: '700', color: '#111827' },
  topRightNote: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdown: {
    width: 200,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  dropdownText: { fontSize: 18, color: '#111827', textAlign: 'center' },
  dropdownPlaceholder: { fontSize: 16, color: '#9CA3AF' },
  primaryButton: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  primaryButtonText: { color: 'white', fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: 360, maxWidth: '100%', backgroundColor: 'white', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111827' },
  list: { maxHeight: 360 },
  listContent: { paddingVertical: 4 },
  listItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: 'transparent' },
  listItemText: { fontSize: 16, color: '#111827' },
  buttonSecondary: { backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 12, alignSelf: 'flex-end' },
  buttonText: { color: 'white', fontWeight: '600' },
  aadhaarContainer: { marginTop: 16, marginBottom: 16, alignItems: 'center', width: '100%' },
  aadhaarLabel: { fontSize: 16, color: '#111827', marginBottom: 8, textAlign: 'center' },
  aadhaarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' },
  digitBox: {
    width: 28,
    height: 36,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 18,
    color: '#111827',
    backgroundColor: 'white',
  },
  groupGap: { marginLeft: 14 },
});


