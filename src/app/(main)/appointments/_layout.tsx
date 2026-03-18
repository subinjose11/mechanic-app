import { Stack } from 'expo-router';

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#06060A' },
        animation: 'fade_from_bottom',
      }}
    />
  );
}
