import React from "react";
import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="profile" />
    </Stack>
  );
};

export default ProfileLayout;
