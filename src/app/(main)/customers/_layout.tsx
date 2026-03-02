import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function CustomersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Customers' }} />
      <Stack.Screen name="[id]" options={{ title: 'Customer Details' }} />
      <Stack.Screen name="new" options={{ title: 'Add Customer', presentation: 'modal' }} />
    </Stack>
  );
}
