import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

import { auth } from "../services/authentication";

import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = ({ navigation }) => {
  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <Text>HomeScreen</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
        <Text>Go To Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
