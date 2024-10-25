import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../services/authentication";
import { getSingleChatMessages, sendMessage } from "../services/livechat";

const LiveChatRoom = ({ route, navigation }) => {
  const [message, setMessage] = useState("");
  const [oldMessages, setOldMessages] = useState([]);
  const flatListRef = useRef(null);
  const { friend } = route.params;

  const profileImage =
    friend.profileImage ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const sendMessages = async () => {
    await sendMessage(friend, message);
    setMessage("");
    getMessages();
  };

  const getMessages = async () => {
    const messages = await getSingleChatMessages(friend, setOldMessages);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    getMessages();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === auth.currentUser.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.friendMessage,
        ]}
      >
        <Text style={styles.senderName}>
          {isMyMessage ? "Ben" : friend.displayName}
        </Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="navigate-before" size={35} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: profileImage }} style={styles.chatUserImage} />
        <Text>{friend.displayName || "Bilinmeyen Kullanıcı"}</Text>
      </View>

      <FlatList
        ref={flatListRef} // FlatList'in ref'ini verdik
        data={oldMessages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        } // İçerik değiştiğinde otomatik olarak en alta kaydır
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mesajınızı yazın..."
          style={styles.messageInput}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity onPress={sendMessages}>
          <MaterialIcons name="send" size={35} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LiveChatRoom;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    elevation: 2,
    gap: 30,
    backgroundColor: "white",
  },
  chatUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    maxWidth: "70%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  friendMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
  },
  messageInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    marginRight: 10,
  },
});
