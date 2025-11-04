import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Link } from 'expo-router';

export default function LoadingScreen() {
  const lines = useMemo(() => [
    'Accessing Government Repositories',
    'Accessing Private Repositories',
    'Calculating Genetic History',
    'Initiating 128000000 qubits',
  ], []);

  const [visibleCount, setVisibleCount] = useState(0);
  const anims = useRef(
    lines.map(() => ({ opacity: new Animated.Value(0), translateY: new Animated.Value(12) }))
  ).current;

  useEffect(() => {
    if (visibleCount >= lines.length) return;
    const id = setTimeout(() => setVisibleCount((c) => c + 1), 2000);
    return () => clearTimeout(id);
  }, [visibleCount, lines.length]);

  // Animate the line that just became visible
  useEffect(() => {
    if (visibleCount === 0) return;
    const idx = visibleCount - 1;
    const target = anims[idx];
    if (!target) return;
    target.opacity.setValue(0);
    target.translateY.setValue(12);
    Animated.parallel([
      Animated.timing(target.opacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(target.translateY, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [visibleCount, anims]);

  const allShown = visibleCount >= lines.length;

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {lines.slice(0, visibleCount).map((text, idx) => (
          <Animated.Text
            key={idx}
            style={[styles.line, { opacity: anims[idx].opacity, transform: [{ translateY: anims[idx].translateY }] }]}
          >
            {text}
          </Animated.Text>
        ))}
      </View>

      {allShown && (
        <Link href="/information" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>LifeLine</Text>
          </Pressable>
        </Link>
      )}

      {!allShown && <Text style={styles.subtle}>Please wait…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  listContainer: { gap: 8, paddingBottom: 16, alignItems: 'center', justifyContent: 'center' },
  line: { fontSize: 18, color: '#111827', textAlign: 'center' },
  button: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 8 },
  buttonSecondary: { backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
  subtle: { color: '#6B7280', marginTop: 8 },
});


