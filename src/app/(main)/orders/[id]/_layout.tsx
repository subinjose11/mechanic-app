import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function OrderDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Order Details',
        }}
      />
      <Stack.Screen
        name="labor"
        options={{
          title: 'Add Labor',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="parts"
        options={{
          title: 'Add Spare Part',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="photos"
        options={{
          title: 'Photos',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Record Payment',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
