import { Stack } from 'expo-router';

export default function OrderDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#06060A' },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="labor" />
      <Stack.Screen name="parts" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
