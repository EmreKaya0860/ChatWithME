import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  getUserDataWithEmail,
  sendFriendRequest,
  getFriends,
  removeFriend,
} from "../services/firestore";
import { auth } from "../services/authentication";

import LoadingIndicator from "../Components/LoadingIndicator";

import AntDesign from "@expo/vector-icons/AntDesign";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const FriendsContainer = ({ friend, setIsLoading, fetchFriends }) => {
  const [removeFriendModalVisibility, setRemoveFriendModalVisibility] =
    useState(false);
  if (!friend) return null;

  const profileImage = friend.profileImage || "https://via.placeholder.com/150";

  const handleRemoveFriend = async (friendEmail, status) => {
    setIsLoading(true);
    const friend = await getUserDataWithEmail(friendEmail);
    const friendDocId = friend[1].docId;
    const currentUser = await getUserDataWithEmail(auth.currentUser.email);
    const currentUserEmail = auth.currentUser.email;
    const receiverDocId = currentUser[1].docId;
    const result = await removeFriend(
      friendEmail,
      friendDocId,
      currentUserEmail,
      receiverDocId,
      status
    );
    console.log(result);
    setRemoveFriendModalVisibility(false);
    fetchFriends();
    setIsLoading(false);
    Alert.alert("Sonuç", result.message);
  };

  return (
    <View style={styles.friendUserContainer}>
      <Image source={{ uri: profileImage }} style={styles.friendUserImage} />
      <Text>{friend.displayName || "Bilinmeyen Kullanıcı"}</Text>
      <TouchableOpacity
        onPress={() =>
          setRemoveFriendModalVisibility(!removeFriendModalVisibility)
        }
      >
        <AntDesign name="delete" size={24} color="red" />
      </TouchableOpacity>
      <Modal
        transparent={true}
        animationType="slide"
        visible={removeFriendModalVisibility}
      >
        <View style={styles.removeFriendModalContainer}>
          <View style={styles.removeFriendModalContent}>
            <Text>Arkadaşınızı silmek istediğinize emin misiniz?</Text>
            <TouchableOpacity
              onPress={() => handleRemoveFriend(friend.email, true)}
            >
              <Text>Evet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveFriend(friend.email, false)}
            >
              <Text>Hayır</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FriendsScreen = ({ navigation }) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [addFriendEmail, setAddFriendEmail] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    const friendsData = await getFriends();
    setFriends(friendsData);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchFriends();
    console.log(friends);
  }, []);

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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text>
        Hiç arkadaşınız yok :/ Mesajlaşmaya başlamak için arkadaş edinin.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <Text>FriendsScreen</Text>
      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <FriendsContainer
            friend={item}
            setIsLoading={setIsLoading}
            fetchFriends={fetchFriends}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={renderEmptyComponent}
        scrollEnabled={true}
        overScrollMode="always"
      />
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
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity onPress={handleAddFriend}>
                <Text>Ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisibility(false)}>
                <Text>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <LoadingIndicator visible={isLoading} />
    </SafeAreaView>
  );
};

export default FriendsScreen;

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
  friendUserContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "yellow",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
    marginVertical: 5,
  },
  friendUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  removeFriendModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  removeFriendModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
});
