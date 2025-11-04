import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="loading" options={{ headerShown: false }} />
        <Stack.Screen name="information" options={{ headerShown: false  }} />
        <Stack.Screen name="choice" options={{ headerShown: false }} />
        <Stack.Screen name="past" options={{ title: 'Past' }} />
        <Stack.Screen name="present" options={{ title: 'Present' }} />
        <Stack.Screen name="future" options={{ title: 'Future' }} />
        <Stack.Screen name="thought" options={{ title: 'Thought' }} />
      </Stack>
    </>
  );
}


