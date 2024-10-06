import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

import { auth } from "../services/authentication";

import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>HomeScreen</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
