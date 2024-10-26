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

// Tarih formatlayıcı fonksiyon
const formatSendTime = (sendTime) => {
  const messageDate = sendTime.toDate(); // Firestore Timestamp'ten Date'e dönüştür
  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24 saat format
  });
};

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
        {/* Mesajın gönderim zamanını gösteriyoruz */}
        <Text style={styles.sendTime}>{formatSendTime(item.sendTime)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="navigate-before" size={35} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: profileImage }} style={styles.chatUserImage} />
        <Text style={styles.headerText}>
          {friend.displayName || "Bilinmeyen Kullanıcı"}
        </Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={oldMessages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#aaa"
          style={styles.messageInput}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity onPress={sendMessages}>
          <MaterialIcons name="send" size={35} color="#bb86fc" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LiveChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1e1e1e",
    elevation: 2,
  },
  chatUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
    backgroundColor: "#bb86fc",
    alignSelf: "flex-end",
  },
  friendMessage: {
    backgroundColor: "#3D3D3D",
    alignSelf: "flex-start",
  },
  senderName: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  sendTime: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1e1e1e",
  },
  messageInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#3D3D3D",
    color: "#fff",
    borderRadius: 20,
    marginRight: 10,
  },
});
