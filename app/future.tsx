import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function FutureScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Future</Text>
      <Text style={styles.subtitle}>What lies ahead.</Text>
      <Link href="/thought" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Go to Thought</Text>
        </Pressable>
      </Link>
      <Link href="/choice" asChild>
        <Pressable style={styles.buttonSecondary}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  button: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 8 },
  buttonSecondary: { backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
});


