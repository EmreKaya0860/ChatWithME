import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { handleLogin, handlePasswordReset } from "../services/authentication";

import { SafeAreaView } from "react-native-safe-area-context";

import LoadingIndicator from "../Components/LoadingIndicator";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wrongError, setWrongError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordResetModalVisibility, setPasswordResetModalVisibility] =
    useState(false);

  const loginAndNavigate = async () => {
    setIsLoading(true);
    const loginResult = await handleLogin(email, password);

    if (loginResult === "Login success") {
      navigation.navigate("SingleChatScreen");
    } else {
      setWrongError("Email or password is wrong!");
    }
    setIsLoading(false);
  };

  const handleNavigation = () => {
    navigation.navigate("RegisterScreen");
  };

  const handlePasswordResetButton = async () => {
    setIsLoading(true);
    const resetResult = await handlePasswordReset(email);
    console.log(resetResult);
    setPasswordResetModalVisibility(!passwordResetModalVisibility);
    setIsLoading(false);
    Alert.alert("Şifre Sıfırlama", resetResult);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>LoginScreen</Text>
      <Text>Email</Text>
      <TextInput
        placeholder="Email"
        onChangeText={(email) => setEmail(email)}
        inputMode="email"
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
      <TouchableOpacity
        onPress={() =>
          setPasswordResetModalVisibility(!passwordResetModalVisibility)
        }
      >
        <Text>Forgot the password? Send Reset Email!</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={passwordResetModalVisibility}
        animationType="slide"
      >
        <View style={styles.resetPasswordContainer}>
          <View style={styles.resetPasswordContent}>
            <Text>Şifrenizi sıfırlamak için email adresinizi giriniz.</Text>
            <Text>
              Not: Şifre sıfırlama epostası almanız için mail adresinizi
              doğrulamanız gerekmektedir!
            </Text>
            <TextInput
              placeholder="Email"
              onChangeText={(email) => setEmail(email)}
              inputMode="email"
            />
            <TouchableOpacity onPress={handlePasswordResetButton}>
              <Text>Şifre Sıfırla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPasswordResetModalVisibility(false)}
            >
              <Text>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  resetPasswordContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  resetPasswordContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
});
