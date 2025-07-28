import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new-project" />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="pdf-preview/[id]" />
      <Stack.Screen name="curtain-rooms/[id]" />
    </Stack>
  );
}
