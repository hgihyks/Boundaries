import { Link } from 'expo-router';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native'; // Import Pressable

export default function ChoiceScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Boundaries</Text>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.row}>
          <Link href="/past" asChild>
            <Pressable
              // 1. Pass a function to the style prop
              style={({ hovered }) => [
                styles.button, // Base style
                hovered && styles.buttonHovered, // Apply hovered style conditionally
              ]}
            >
              <Text style={styles.buttonText}>Past</Text>
            </Pressable>
          </Link>
          <Link href="/present" asChild>
            <Pressable
              style={({ hovered }) => [
                styles.button,
                hovered && styles.buttonHovered,
              ]}
            >
              <Text style={styles.buttonText}>Present</Text>
            </Pressable>
          </Link>
          <Link href="/future" asChild>
            <Pressable
              style={({ hovered }) => [
                styles.button,
                hovered && styles.buttonHovered,
              ]}
            >
              <Text style={styles.buttonText}>Future</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ... styles defined below ...

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 16 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 66, fontWeight: '800', marginBottom: 16, textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 300, marginBottom: 60 },
  button: {
    backgroundColor: '#111827', // Original color
    paddingVertical: 400,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  // Add the new hover style
  buttonHovered: {
    backgroundColor: '#374151', // New color on hover
    // You can add other style changes here, e.g.,
    // transform: [{ scale: 1.05 }],
  },
  buttonSecondary: { backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
});


