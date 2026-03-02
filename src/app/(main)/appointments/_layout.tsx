import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function AppointmentsLayout() {
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
          title: 'Appointments',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'Book Appointment',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
