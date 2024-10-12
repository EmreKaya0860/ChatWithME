import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <Text>HomeScreen</Text>
      <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
        <Text>Go To Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
