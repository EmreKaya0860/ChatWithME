import { app } from "./firebaseconfig";
import {
  getReactNativePersistence,
  initializeAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return "Login success";
  } catch (error) {
    return "Login failed";
  }
};

export const handleRegister = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user.uid;
  } catch (error) {
    return "Register failed";
  }
};

export const handleUpdateEmail = (user, email) => {
  updateEmail(user, email)
    .then(() => {
      console.log("Email updated successfully!");
    })
    .catch((error) => {
      console.error("Error updating email: ", error);
    });
};

export const handleUpdatePassword = (user, password) => {
  updatePassword(user, password)
    .then(() => {
      console.log("Password updated successfully!");
    })
    .catch((error) => {
      console.error("Error updating password: ", error);
    });
};

export const verifyEmail = (user) => {
  sendEmailVerification(user)
    .then(() => {
      console.log("Verification email sent!");
      user.reload();
      return "Verification email sent!";
    })
    .catch((error) => {
      return error.message;
    });
};

export const reauthenticate = async (user, email, password) => {
  const credential = EmailAuthProvider.credential(email, password);
  try {
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error("Error reauthenticating: ", error);
  }
};
