import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { getUserDataWithEmail, sendFriendRequest } from "../services/firestore";
import { auth } from "../services/authentication";

import LoadingIndicator from "../Components/LoadingIndicator";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const HomeScreen = ({ navigation }) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [addFriendEmail, setAddFriendEmail] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFriend = async () => {
    if (validateEmail(addFriendEmail)) {
      setIsLoading(true);
      const receiver = await getUserDataWithEmail(addFriendEmail);

      if (receiver.length > 0) {
        const receiverDocId = receiver[1].docId;
        const sender = await getUserDataWithEmail(auth.currentUser.email);
        const senderDocId = sender[1].docId;
        const result = await sendFriendRequest(
          senderDocId,
          receiverDocId,
          sender[0],
          receiver[0]
        );
        Alert.alert("Sonuç", result.message);
        setModalVisibility(false);
        setEmailError("");
      } else {
        setEmailError("Kullanıcı bulunamadı.");
      }
    } else {
      setEmailError("Geçerli bir e-posta adresi giriniz.");
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <Text>HomeScreen</Text>
      <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
        <Text>Go To Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setModalVisibility(!modalVisibility)}>
        <Text>Add Friend</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("FriendRequestsScreen")}
      >
        <Text>Friend Requests</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisibility}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisibility(false)}
      >
        <View style={styles.addFriendModalContainer}>
          <View style={styles.addFriendModalContent}>
            <Text>Arkadaş Ekle</Text>
            <Text>
              Arkadaş eklemek istediğiniz kişinin e-posta adresini giriniz:
            </Text>
            <TextInput
              style={styles.inputArea}
              placeholder="E-posta"
              keyboardType="email-address"
              onChangeText={(email) => {
                setAddFriendEmail(email);
                setEmailError("");
              }}
            />
            <Text style={styles.emailError}>{emailError}</Text>
            <TouchableOpacity onPress={handleAddFriend}>
              <Text>EKLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LoadingIndicator visible={isLoading} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  addFriendModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  addFriendModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
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
  emailError: {
    color: "red",
  },
});
