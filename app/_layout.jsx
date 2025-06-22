import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new-prject" />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="pdf-preview/[id]" />
    </Stack>
  );
}
