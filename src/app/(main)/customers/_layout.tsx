import { Stack } from 'expo-router';

export default function CustomersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#06060A' },
        animation: 'fade_from_bottom',
        navigationBarColor: '#06060A',
      }}
    />
  );
}
