import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { handleLogin } from "../services/authentication";

import { SafeAreaView } from "react-native-safe-area-context";

import LoadingIndicator from "../Components/LoadingIndicator";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wrongError, setWrongError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginAndNavigate = async () => {
    setIsLoading(true);
    const loginResult = await handleLogin(email, password);

    if (loginResult === "Login success") {
      navigation.navigate("HomeScreen");
    } else {
      setWrongError("Email or password is wrong!");
    }
    setIsLoading(false);
  };

  const handleNavigation = () => {
    navigation.navigate("RegisterScreen");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>LoginScreen</Text>
      <Text>Email</Text>
      <TextInput
        placeholder="Email"
        onChangeText={(email) => setEmail(email)}
      />
      <Text>Şifre</Text>
      <TextInput
        placeholder="Şifre"
        onChangeText={(password) => setPassword(password)}
        secureTextEntry
      />
      <Text style={styles.wrongError}>{wrongError}</Text>
      <TouchableOpacity onPress={loginAndNavigate}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNavigation}>
        <Text>Do not have account? Register</Text>
      </TouchableOpacity>
      {isLoading ? <LoadingIndicator visible={isLoading} /> : null}
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  wrongError: {
    color: "red",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
