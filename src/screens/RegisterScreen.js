import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View, TextInput, Button, Modal } from "react-native";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import { auth } from "../services/authentication";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../services/firestore";
import { addDoc, collection } from "firebase/firestore";

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const initialValues = {
  email: "",
  password: "",
  displayName: "",
  profileImage: "",
  createdAt: getCurrentDate(),
  updatedAt: getCurrentDate(),
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
  profileImage: Yup.string(),
});

const RegisterScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null); // Kullanıcı bilgilerini saklamak için

  const handleSignup = (values) => {
    // Kullanıcı bilgilerini modalda göster
    setUserData(values);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    const { email, password } = userData;

    try {
      // Kayıt işlemini gerçekleştir
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid; // Mevcut kullanıcı ID'si

      // Kullanıcı verilerini Firestore'a ekle
      await addDoc(collection(db, "users"), { ...userData, userId });

      // Kayıt başarılı, HomeScreen'e yönlendir
      navigation.navigate("HomeScreen");
      setModalVisible(false); // Modalı kapat
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    // Modal iptal edildiğinde, kullanıcı bilgilerini temizle
    setModalVisible(false);
    setUserData(null); // İstersen kullanıcı bilgilerini sıfırla
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSignup} // Kayıt işlemi modalı açar
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
            <Text>Profil Resmi</Text>
            <TextInput
              onChangeText={handleChange("profileImage")}
              value={values.profileImage}
              placeholder="Profile Image"
            />
            {errors.profileImage && (
              <Text style={styles.error}>{errors.profileImage}</Text>
            )}
            <Button onPress={handleSubmit} title="Kayıt Ol" />

            {/* Modal */}
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
                  <Text>Profil Resmi: {userData?.profileImage}</Text>
                  <Button title="Onayla" onPress={handleConfirm} />
                  <Button title="İptal" onPress={handleCancel} />
                </View>
              </View>
            </Modal>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Yarı saydam arka plan
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
});
