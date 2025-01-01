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
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingIndicator from "../Components/LoadingIndicator";
import { handleLogin, handlePasswordReset } from "../services/authentication";

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
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          onChangeText={(email) => setEmail(email)}
          inputMode="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          onChangeText={(password) => setPassword(password)}
          secureTextEntry
        />
        {wrongError ? (
          <Text style={styles.wrongError}>{wrongError}</Text>
        ) : null}
        <TouchableOpacity style={styles.button} onPress={loginAndNavigate}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigation}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            setPasswordResetModalVisibility(!passwordResetModalVisibility)
          }
        >
          <Text style={styles.linkText}>
            Forgot the password? Send Reset Email!
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={passwordResetModalVisibility}
        animationType="slide"
      >
        <View style={styles.resetPasswordContainer}>
          <View style={styles.resetPasswordContent}>
            <Text style={styles.resetPasswordText}>
              Enter your email to reset your password.
            </Text>
            <Text style={styles.resetPasswordNote}>
              Note: You need to verify your email address to receive a password
              reset email!
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              onChangeText={(email) => setEmail(email)}
              inputMode="email"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handlePasswordResetButton}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPasswordResetModalVisibility(false)}
            >
              <Text style={styles.linkText}>Close</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E", // Daha açık bir gri ton
    justifyContent: "center",
  },
  innerContainer: {
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#3D3D3D", // Daha açık bir gri ton
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  wrongError: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#bb86fc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#bb86fc",
    textAlign: "center",
    marginTop: 10,
  },
  resetPasswordContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  resetPasswordContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#3D3D3D", // Daha açık bir gri ton
    borderRadius: 10,
    elevation: 5,
  },
  resetPasswordText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  resetPasswordNote: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
});
