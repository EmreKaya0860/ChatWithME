import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MainRouter from "./src/router/MainRouter";

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainRouter />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
