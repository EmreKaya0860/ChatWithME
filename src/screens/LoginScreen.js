import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { auth } from "../services/authentication";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wrongError, setWrongError] = useState("");

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
        navigation.navigate("HomeScreen");
      })
      .catch((error) => {
        console.log(error);
        setWrongError("Email veya şifre hatalı!");
      });
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
      <TouchableOpacity onPress={handleLogin}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNavigation}>
        <Text>Do not have account? Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  wrongError: {
    color: "red",
  },
});
