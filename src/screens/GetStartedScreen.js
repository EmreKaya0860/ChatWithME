import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";

const GetStartedScreen = ({ navigation }) => {
  const handleNavigate = () => {
    navigation.navigate("LoginScreen");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>GetStartedScreen</Text>
      <TouchableOpacity onPress={handleNavigate}>
        <Text>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({});
