import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function VehiclesLayout() {
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
          title: 'Vehicles',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Vehicle Details',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'Add Vehicle',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
