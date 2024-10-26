import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
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
    navigation.addListener("focus", () => {
      fetchUserData();
    });
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Profil Bilgileri</Text>
        <SetImage
          docId={documentId}
          profileImageURL={userData.profileImage}
          navigation={navigation}
        />
        <View style={styles.editableInfoArea}>
          <View style={styles.info}>
            <View style={styles.currentInfo}>
              <Text style={styles.infoText}>Email: {userData.email}</Text>
              {auth.currentUser.emailVerified ? (
                <>
                  {isEditable === "email" ? (
                    <TouchableOpacity onPress={() => setIsEditable("")}>
                      <Text style={styles.cancelText}>İptal</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditable("email")}>
                      <Text style={styles.editText}>Değiştir</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.verifyMailContainer}>
                  <Text style={styles.verifyMailError}>
                    Email onaylı değil!
                  </Text>
                  <TouchableOpacity onPress={() => handleEmailVerification()}>
                    <Text style={styles.verifyText}>Onayla</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {isEditable === "email" && (
              <View style={styles.editInfoContainer}>
                <Text style={styles.infoText}>Yeni Email:</Text>
                <TextInput
                  value={userData.email}
                  onChangeText={(text) =>
                    setUserData({ ...userData, email: text })
                  }
                  style={styles.inputArea}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  onPress={() => handleUpdate()}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <View style={styles.currentInfo}>
              <Text style={styles.infoText}>
                Ad Soyad: {userData.displayName}
              </Text>
              {isEditable === "displayName" ? (
                <TouchableOpacity onPress={() => setIsEditable("")}>
                  <Text style={styles.cancelText}>İptal</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsEditable("displayName")}>
                  <Text style={styles.editText}>Değiştir</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditable === "displayName" && (
              <View style={styles.editInfoContainer}>
                <Text style={styles.infoText}>Yeni Ad Soyad:</Text>
                <TextInput
                  value={userData.displayName}
                  onChangeText={(text) =>
                    setUserData({ ...userData, displayName: text })
                  }
                  style={styles.inputArea}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  onPress={() => handleUpdate()}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <View style={styles.currentInfo}>
              <Text style={styles.infoText}>Şifreyi Değiştir:</Text>
              {isEditable === "password" ? (
                <TouchableOpacity onPress={() => setIsEditable("")}>
                  <Text style={styles.cancelText}>İptal</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsEditable("password")}>
                  <Text style={styles.editText}>Değiştir</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditable === "password" && (
              <View style={styles.editPasswordInfoContainer}>
                <Text style={styles.infoText}>Eski Şifre:</Text>
                <TextInput
                  onChangeText={(text) => setEnteredOldPassword(text)}
                  style={styles.inputArea}
                  secureTextEntry
                  placeholderTextColor="#aaa"
                />
                <Text style={styles.infoText}>Yeni Şifre:</Text>
                <TextInput
                  onChangeText={(text) =>
                    setUserData({ ...userData, password: text })
                  }
                  style={styles.inputArea}
                  secureTextEntry
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  onPress={() => handleUpdate()}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.profileDateContainer}>
          <Text style={styles.infoText}>
            Profil Oluşturma Tarihi: {userData.createdAt}
          </Text>
          <Text style={styles.infoText}>
            Profil Güncelleme Tarihi: {userData.updatedAt}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setDeleteAccountModalVisibility(!deleteAccountModalVisibility)
            }
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          animationType="fade"
          visible={deleteAccountModalVisibility}
        >
          <View style={styles.deleteAccountModalContainer}>
            <View style={styles.deleteAccountModalContent}>
              <Text style={styles.modalText}>
                Hesabınızı silmek istediğinize emin misiniz?
              </Text>
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
                    setDeleteAccountModalVisibility(
                      !deleteAccountModalVisibility
                    )
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  editableInfoArea: {
    backgroundColor: "#3D3D3D",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  info: {
    marginVertical: 10,
  },
  currentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  verifyMailContainer: {
    alignItems: "center",
    gap: 10,
  },
  verifyMailError: {
    color: "#ff5252", // Red color for error
    marginRight: 10,
  },
  editInfoContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputArea: {
    backgroundColor: "#3D3D3D",
    borderRadius: 5,
    padding: 10,
    color: "#fff",
    marginBottom: 10,
  },
  editPasswordInfoContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  profileDateContainer: {
    marginTop: 20,
  },
  profileDateText: {
    color: "#aaa",
    marginBottom: 5,
  },
  signOutButton: {
    backgroundColor: "#bb86fc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteAccountButton: {
    backgroundColor: "#ff5252", // Red color for delete account button
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  deleteAccountButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteAccountModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  deleteAccountModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    alignItems: "center",
  },
  importantNoteText: {
    color: "#ff5252", // Red color for important note
    marginVertical: 10,
    textAlign: "center",
  },
  deleteAccountModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  deleteAccountModalAcceptButton: {
    backgroundColor: "#bb86fc",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteAccountModalRejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  deleteAccountModalButtonsTextColor: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  cancelText: {
    color: "#ff5252", // Red color for cancel text
    fontSize: 16,
  },
  editText: {
    color: "#bb86fc",
    fontSize: 16,
  },
  verifyMailError: {
    color: "#ff5252", // Red color for error
    fontSize: 16,
  },
  verifyText: {
    color: "#bb86fc",
    fontSize: 16,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
  },
  importantNoteText: {
    color: "#ff5252", // Red color for important note
    fontSize: 16,
    textAlign: "center",
  },
  deleteAccountModalButtonsTextColor: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#ff5252", // Kırmızı renk
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
});
