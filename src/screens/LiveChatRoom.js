import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
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
import { getSingleChatMessages, sendMessage } from "../services/livechat";

import { uploadChatFile } from "../services/storage";

import RenderMessage from "../Components/LiveChatRoom/RenderMessage";

const LiveChatRoom = ({ route, navigation }) => {
  const [message, setMessage] = useState("");
  const [oldMessages, setOldMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const flatListRef = useRef(null);
  const { friend } = route.params;
  const defaultImageUrl = process.env.EXPO_PUBLIC_DEFAULT_FRIEND_IMAGE_URL;
  const profileImage = friend.profileImage || defaultImageUrl;

  const sendMessages = async () => {
    if (selectedFile) {
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();
      const downloadUrl = await uploadChatFile(blob);
    }
    await sendMessage(friend, message);
    setMessage("");
    getMessages();
    setSelectedFile(null);
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

  const pickDocument = async () => {
    try {
      console.log("Dosya seçme işlemi başlatıldı ...");
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled === false) {
        setSelectedFile(result.assets[0]);
        setMessage(result.assets[0].name);
        console.log("Seçilen dosya:", result.assets[0]);
      } else {
        console.log("Dosya seçme işlemi iptal edildi.");
      }
    } catch (error) {
      console.error("Dosya seçme hatası:", error);
    }
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
        renderItem={({ item }) => <RenderMessage item={item} friend={friend} />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickDocument}>
          <MaterialIcons name="attach-file" size={30} color="#bb86fc" />
        </TouchableOpacity>
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
      {selectedFile && (
        <View style={styles.fileContainer}>
          <Text style={styles.fileName}>{selectedFile.name}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LiveChatRoom;

export const styles = StyleSheet.create({
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
  }, //
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
  messageTime: {
    marginTop: 5,
    fontSize: 12,
    color: "#bbb",
    alignSelf: "flex-end",
  }, //
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
    marginHorizontal: 10,
  },
  fileContainer: {
    padding: 10,
    backgroundColor: "#3D3D3D",
    margin: 10,
    borderRadius: 10,
    flexWrap: "wrap",
  },
  fileName: {
    color: "#fff",
    fontSize: 14,
  },
});
