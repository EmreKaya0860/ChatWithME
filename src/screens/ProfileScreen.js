import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  auth,
  handleDeleteUser,
  handleUpdateEmail,
  handleUpdatePassword,
  reauthenticate,
  verifyEmail,
} from "../services/authentication";
import {
  getUserData,
  handleDeleteAccountDocument,
  updateUserData,
} from "../services/firestore";

import LoadingIndicator from "../Components/LoadingIndicator";
import SetImage from "../Components/SetImage";

import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [isEditable, setIsEditable] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [oldUserData, setOldUserData] = useState({});
  const [enteredOldPassword, setEnteredOldPassword] = useState("");
  const [deleteAccountModalVisibility, setDeleteAccountModalVisibility] =
    useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUserData = async () => {
      const data = await getUserData(auth.currentUser.uid);
      if (data && data[0]) {
        setUserData(data[0]);
        setOldUserData(data[0]);
        setEnteredOldPassword(data[0].password);
        setDocumentId(data[1].docId);
      }
      setLoading(false);
      console.log(auth.currentUser.email);
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    await reauthenticate(
      auth.currentUser,
      oldUserData.email,
      oldUserData.password
    );
    if (oldUserData.password !== enteredOldPassword) {
      Alert.alert("Hata", "Eski Şifre uyuşmuyor!", [{ text: "Tamam" }]);
      setLoading(false);
      return;
    } else if (oldUserData.password !== userData.password) {
      console.log("Şifre değişti");
      Alert.alert(
        "Şifre Değişikliği",
        "Şife değişikliği sonrası yeniden giriş yapmanız gerekmektedir!",
        [{ text: "Tamam" }]
      );
      handleUpdatePassword(auth.currentUser, userData.password);
      auth.signOut();
    }
    userData.updatedAt = new Date().toLocaleString();
    const result = await updateUserData(documentId, userData);
    if (auth.currentUser.email !== userData.email) {
      console.log("Email değişti");
      console.log(auth.currentUser.emailVerified);
      Alert.alert(
        "Email Değişikliği",
        "Email değişikliği sonrası yeniden giriş yapmanız gerekmektedir!",
        [{ text: "Tamam" }]
      );
      handleUpdateEmail(auth.currentUser, userData.email);
      auth.signOut();
    }
    if (result === "User data updated successfully!") {
      Alert.alert("Başarılı", "Kullanıcı bilgileri güncellendi!", [
        { text: "Tamam" },
      ]);
    } else {
      Alert.alert("Hata", "Kullanıcı bilgileri güncellenemedi!", [
        { text: "Tamam" },
      ]);
    }
    setLoading(false);
    setIsEditable("");
    console.log(oldUserData.password);
  };

  const handleEmailVerification = () => {
    const result = verifyEmail(auth.currentUser);
    Alert.alert("Email onayı", "Mail'inize onay epostası gönderildi", [
      { text: "Tamam" },
    ]);
    console.log(result);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    await reauthenticate(
      auth.currentUser,
      oldUserData.email,
      oldUserData.password
    );
    await handleDeleteAccountDocument(documentId, oldUserData.email);
    const result = await handleDeleteUser(auth.currentUser);
    Alert.alert("Hesap Silme", result, [{ text: "Tamam" }]);
  };

  const handleSignOut = () => {
    auth.signOut();
  };
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Profil Bilgileri</Text>
      <SetImage
        docId={documentId}
        profileImageURL={userData.profileImage}
        navigation={navigation}
      />
      <View style={styles.editableInfoArea}>
        <View style={styles.info}>
          <View style={styles.currentInfo}>
            <Text>Email: {userData.email}</Text>
            {auth.currentUser.emailVerified ? (
              <>
                {isEditable === "email" ? (
                  <TouchableOpacity onPress={() => setIsEditable("")}>
                    <Text>İptal</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setIsEditable("email")}>
                    <Text>Değiştir</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.verifyMailContainer}>
                <Text style={styles.verifyMailError}>Email onaylı değil!</Text>
                <TouchableOpacity onPress={() => handleEmailVerification()}>
                  <Text>Onayla</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View>
            {isEditable === "email" ? (
              <View style={styles.editInfoContainer}>
                <Text>Yeni Email:</Text>
                <TextInput
                  value={userData.email}
                  onChangeText={(text) =>
                    setUserData({ ...userData, email: text })
                  }
                  style={styles.inputArea}
                />
                <TouchableOpacity onPress={() => handleUpdate()}>
                  <Text>Kaydet</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.info}>
          <View style={styles.currentInfo}>
            <Text>Ad Soyad: {userData.displayName}</Text>

            {isEditable === "displayName" ? (
              <TouchableOpacity onPress={() => setIsEditable("")}>
                <Text>İptal</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditable("displayName")}>
                <Text>Değiştir</Text>
              </TouchableOpacity>
            )}
          </View>
          <View>
            {isEditable === "displayName" ? (
              <View style={styles.editInfoContainer}>
                <Text>Yeni Ad Soyad:</Text>
                <TextInput
                  value={userData.displayName}
                  onChangeText={(text) =>
                    setUserData({ ...userData, displayName: text })
                  }
                  style={styles.inputArea}
                />
                <TouchableOpacity onPress={() => handleUpdate()}>
                  <Text>Kaydet</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.info}>
          <View style={styles.currentInfo}>
            <Text>Şifreyi Değiştir: </Text>
            {isEditable === "password" ? (
              <TouchableOpacity onPress={() => setIsEditable("")}>
                <Text>İptal</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditable("password")}>
                <Text>Değiştir</Text>
              </TouchableOpacity>
            )}
          </View>
          <View>
            {isEditable === "password" ? (
              <View style={styles.editPasswordInfoContainer}>
                <Text>Eski Şifre:</Text>
                <TextInput
                  onChangeText={(text) => setEnteredOldPassword(text)}
                  style={styles.inputArea}
                  secureTextEntry
                />
                <Text>Yeni Şifre:</Text>
                <TextInput
                  onChangeText={(text) =>
                    setUserData({ ...userData, password: text })
                  }
                  style={styles.inputArea}
                  secureTextEntry
                />
                <TouchableOpacity onPress={() => handleUpdate()}>
                  <Text>Kaydet</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.profileDateContainer}>
        <Text>Profil Oluşturma Tarihi: {userData.createdAt}</Text>
        <Text>Profil Güncelleme Tarihi: {userData.updatedAt}</Text>
        <TouchableOpacity
          onPress={() =>
            setDeleteAccountModalVisibility(!deleteAccountModalVisibility)
          }
        >
          <Text>Hesabı Sil</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        animationType="fade"
        visible={deleteAccountModalVisibility}
      >
        <View style={styles.deleteAccountModalContainer}>
          <View style={styles.deleteAccountModalContent}>
            <Text>Hesabınızı silmek istediğinize emin misiniz?</Text>
            <Text style={styles.importantNoteText}>
              Not: Hesabınızı sildiğinizde geri dönüşü olmayacaktır!
            </Text>
            <View style={styles.deleteAccountModalButtons}>
              <TouchableOpacity
                style={styles.deleteAccountModalAcceptButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteAccountModalButtonsTextColor}>
                  Evet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteAccountModalRejectButton}
                onPress={() =>
                  setDeleteAccountModalVisibility(!deleteAccountModalVisibility)
                }
              >
                <Text style={styles.deleteAccountModalButtonsTextColor}>
                  Hayır
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {loading && <LoadingIndicator visible={loading} />}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  editableInfoArea: {
    height: 500,
  },
  profileDateContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    display: "flex",
    justifyContent: "space-around",
    height: 50,
    gap: 10,
    backgroundColor: "yellow",
    height: 100,
  },
  currentInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editInfoContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editPasswordInfoContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputArea: {
    borderWidth: 1,
    borderColor: "gray",
    width: 200,
    backgroundColor: "white",
    marginTop: 10,
    padding: 5,
    color: "black",
  },
  verifyMailError: {
    color: "red",
    display: "flex",
    flexWrap: "wrap",
  },
  verifyMailContainer: {
    display: "flex",
    backgroundColor: "yellow",
    width: 150,
    gap: 5,
    alignItems: "center",
  },
  signOutButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  deleteAccountModalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAccountModalContent: {
    backgroundColor: "white",
    width: "80%",
    height: "25%",
    borderRadius: 10,
    padding: 20,
    gap: 20,
  },
  importantNoteText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteAccountModalButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  deleteAccountModalAcceptButton: {
    backgroundColor: "red",
    width: 100,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  deleteAccountModalRejectButton: {
    backgroundColor: "green",
    width: 100,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  deleteAccountModalButtonsTextColor: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
