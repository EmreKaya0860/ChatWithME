import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View, TextInput, Button, Modal } from "react-native";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import { handleRegister } from "../services/authentication";
import { addData } from "../services/firestore";

import LoadingIndicator from "../Components/LoadingIndicator";

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
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSignup}
      >
        {({ handleChange, handleSubmit, values, errors }) => (
          <View>
            <Text>Email</Text>
            <TextInput
              onChangeText={handleChange("email")}
              value={values.email}
              placeholder="Email"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            <Text>Şifre</Text>
            <TextInput
              onChangeText={handleChange("password")}
              value={values.password}
              placeholder="Password"
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
            <Text>Ad Soyad</Text>
            <TextInput
              onChangeText={handleChange("displayName")}
              value={values.displayName}
              placeholder="Display Name"
            />
            {errors.displayName && (
              <Text style={styles.error}>{errors.displayName}</Text>
            )}
            <Button onPress={handleSubmit} title="Kayıt Ol" />
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text>Kayıt Bilgileriniz:</Text>
                  <Text>Email: {userData?.email}</Text>
                  <Text>Ad Soyad: {userData?.displayName}</Text>
                  <Text>
                    Not: Bilgilerinizi onayladıktan sonra otomatik olarak giriş
                    yaparak Ana Sayfaya yönlendirileceksiniz. Daha sonra profil
                    kısmından bilgilerinizi güncelleyebilirsiniz.
                  </Text>
                  <Button title="Onayla" onPress={handleConfirm} />
                  <Button title="İptal" onPress={handleCancel} />
                </View>
              </View>
            </Modal>
            <LoadingIndicator visible={isLoading} />
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  error: {
    color: "red",
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
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    gap: 10,
  },
});
