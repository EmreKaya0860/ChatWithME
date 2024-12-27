import { Formik } from "formik";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import LoadingIndicator from "../Components/LoadingIndicator";
import { handleRegister } from "../services/authentication";
import { addData } from "../services/firestore";

const initialValues = {
  email: "",
  password: "",
  displayName: "",
  createdAt: new Date().toLocaleString(),
  updatedAt: new Date().toLocaleString(),
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email adresi hatalı!")
    .required("Email adresi boş geçilemez!"),
  password: Yup.string()
    .required("Şifre boş geçilemez!")
    .min(6, "Şifre en az 6 karakter olmalıdır!"),
  displayName: Yup.string()
    .required("Ad Soyad boş geçilemez!")
    .min(2, "Ad Soyad en az 2 karakter olmalıdır!")
    .max(50, "Ad Soyad en fazla 50 karakter olmalıdır!"),
});

const RegisterScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (values) => {
    setUserData(values);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    const { email, password } = userData;
    setIsLoading(true);
    try {
      const userId = await handleRegister(email, password);
      await addData("users", { ...userData, userId });
      navigation.navigate("SingleChatScreen");
      setModalVisible(false);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setUserData(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSignup}
      >
        {({ handleChange, handleSubmit, values, errors }) => (
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Register</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange("email")}
              value={values.email}
              placeholder="Email"
              placeholderTextColor="#aaa"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            <TextInput
              style={styles.input}
              onChangeText={handleChange("password")}
              value={values.password}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
            <TextInput
              style={styles.input}
              onChangeText={handleChange("displayName")}
              value={values.displayName}
              placeholder="Display Name"
              placeholderTextColor="#aaa"
            />
            {errors.displayName && (
              <Text style={styles.error}>{errors.displayName}</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Kayıt Bilgileriniz:</Text>
                  <Text style={styles.modalText}>Email: {userData?.email}</Text>
                  <Text style={styles.modalText}>
                    Ad Soyad: {userData?.displayName}
                  </Text>
                  <Text style={styles.modalNote}>
                    Not: Bilgilerinizi onayladıktan sonra otomatik olarak giriş
                    yaparak Ana Sayfaya yönlendirileceksiniz. Daha sonra profil
                    kısmından bilgilerinizi güncelleyebilirsiniz.
                  </Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.buttonText}>Onayla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCancel}
                  >
                    <Text style={styles.buttonText}>İptal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            {isLoading ? <LoadingIndicator visible={isLoading} /> : null}
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default RegisterScreen;

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
    backgroundColor: "#3D3D3D",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  error: {
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#3D3D3D",
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  modalNote: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
});
