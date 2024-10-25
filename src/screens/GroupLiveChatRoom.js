import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../services/authentication";
import {
  addFriendToGroup,
  changeGroupName,
  getGroupChatMessages,
  leaveGroup,
  removeFriendFromGroup,
  sendGroupMessage,
} from "../services/livechat";

const FriendsContainer = ({ friend, group }) => {
  if (!friend) return null;
  const profileImage = friend.profileImage || "https://via.placeholder.com/150";

  const handleRemoveFriend = async () => {
    await removeFriendFromGroup(group, friend);
    Alert.alert(
      "Başarılı",
      "Kişi başarıyla gruptan çıkarıldı. Değişiklikleri görmek için gruplar sayfasına geri dönmeniz gerekmektedir :/",
      [{ text: "Tamam" }]
    );
  };

  const handleRemoveButton = () => {
    Alert.alert(
      "Dikkat",
      "Bu kişiyi gruptan çıkarmak istediğinize emin misiniz?",
      [
        {
          text: "Evet",
          onPress: () => handleRemoveFriend(),
        },
        {
          text: "Hayır",
          onPress: () => console.log("Hayır"),
        },
      ]
    );
  };

  return (
    <View style={styles.friendUserContainer}>
      <Image source={{ uri: profileImage }} style={styles.friendUserImage} />
      <Text>{friend.displayName || "Bilinmeyen Kullanıcı"}</Text>
      {group.adminId === auth.currentUser.uid && (
        <TouchableOpacity onPress={handleRemoveButton}>
          <Text>Çıkar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const AddNewMemberContainer = ({ friend, group }) => {
  if (!friend) return null;
  const profileImage = friend.profileImage || "https://via.placeholder.com/150";

  const handleAddNewMember = async () => {
    await addFriendToGroup(group, friend);
    Alert.alert(
      "Başarılı",
      "Kişi başarıyla gruba eklendi. Değişiklikleri görebilmek için gruplar sayfasına dönünüz :/",
      [{ text: "Tamam" }]
    );
  };

  const handlePressAddNewMemberButton = async () => {
    Alert.alert(
      "Dikkat",
      "Bu kişiyi gruba eklemek istediğinize emin misiniz?",
      [
        { text: "Evet", onPress: () => handleAddNewMember() },
        { text: "Hayır", onPress: () => console.log("Hayır") },
      ]
    );
  };

  return (
    <View style={styles.friendUserContainer}>
      <Image source={{ uri: profileImage }} style={styles.friendUserImage} />
      <Text>{friend.displayName || "Bilinmeyen Kullanıcı"}</Text>
      <TouchableOpacity onPress={handlePressAddNewMemberButton}>
        <Text>Ekle</Text>
      </TouchableOpacity>
    </View>
  );
};

const GroupLiveChatRoom = ({ route, navigation }) => {
  const { group, friends } = route.params;
  const [message, setMessage] = useState("");
  const [oldMessages, setOldMessages] = useState([]);
  const [isGroupInfoModalVisible, setIsGroupInfoModalVisible] = useState(false);
  const [isGroupNameEditable, setIsGroupNameEditable] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddNewMembersModalVisible, setIsAddNewMembersModalVisible] =
    useState(false);
  const flatListRef = useRef(null);
  const notincludefriends = friends.filter(
    (friend) => !group.members.some((member) => member.userId === friend.userId)
  );

  const sendMessages = async () => {
    await sendGroupMessage(group, message);
    setMessage("");
    getMessages();
  };

  const getMessages = async () => {
    const messages = await getGroupChatMessages(group, setOldMessages);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    getMessages();
  }, []);
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleChangeGroupName = async () => {
    await changeGroupName(group, newGroupName);
    setIsGroupNameEditable(false);
    Alert.alert(
      "Başarılı",
      "Grup adı başarıyla değiştirildi. Değişiklikleri görebilmek için gruplar ekranına tekrardan dönmeniz gerekmektedir :/",
      [{ text: "Tamam" }]
    );
  };

  const handleLeaveGroup = async () => {
    await leaveGroup(group);
    Alert.alert(
      "Başarılı",
      "Grup başarıyla terk edildi. Değişiklikleri Görebilmeniz için gruplar sayfasına dönmeniz gerekmektedir :/",
      [{ text: "Tamam" }]
    );
  };

  const handlePressLeaveGroupButton = async () => {
    Alert.alert("Dikkat", "Bu gruptan ayrılmak istediğinize emin misiniz?", [
      { text: "Evet", onPress: () => handleLeaveGroup() },
      { text: "Hayır", onPress: () => console.log("Hayır") },
    ]);
  };

  const handleAddNewMembers = () => {
    console.log("add new members");
    console.log(notincludefriends);
    setIsAddNewMembersModalVisible(!isAddNewMembersModalVisible);
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
          {isMyMessage ? "Ben" : item.senderName}
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
        <TouchableOpacity
          style={styles.groupNameContainer}
          onPress={() => setIsGroupInfoModalVisible(!isGroupInfoModalVisible)}
        >
          <MaterialIcons name="groups" size={35} color="black" />
          {group.groupName && <Text>{group.groupName}</Text>}
        </TouchableOpacity>
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
          style={styles.messageInput}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity onPress={sendMessages}>
          <MaterialIcons name="send" size={35} color="black" />
        </TouchableOpacity>
      </View>
      <Modal visible={isGroupInfoModalVisible} transparent={true}>
        <View style={styles.groupInfoModalContainer}>
          <View style={styles.groupInfoModalContent}>
            <View>
              <Text>Grup Bilgileri</Text>
              <View style={styles.groupNameModalContainer}>
                <Text>Grup Adı: </Text>
                {isGroupNameEditable ? (
                  <View style={styles.groupNameChangeContainer}>
                    <TextInput
                      placeholder={group.groupName}
                      onChangeText={(text) => setNewGroupName(text)}
                    />
                    <TouchableOpacity
                      onPress={() => setIsGroupNameEditable(false)}
                    >
                      <Text>Vazgeç</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleChangeGroupName()}>
                      <Text>Değiştir</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text>{group.groupName}</Text>
                    <TouchableOpacity
                      onPress={() => setIsGroupNameEditable(true)}
                    >
                      <MaterialIcons name="edit-note" size={30} color="black" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <Text>Üyeler:</Text>
              <FlatList
                data={group.members}
                renderItem={({ item }) => (
                  <FriendsContainer friend={item} group={group} />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              {group.adminId === auth.currentUser.uid ? (
                <>
                  <TouchableOpacity onPress={handleAddNewMembers}>
                    <Text>Gruba Üye Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text>Grubu Sil</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handlePressLeaveGroupButton}>
                  <Text>Grubu Terk Et</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() =>
                  setIsGroupInfoModalVisible(!isGroupInfoModalVisible)
                }
              >
                <Text>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isAddNewMembersModalVisible}>
        <View style={styles.addNewMembersModalContainer}>
          <Text>Gruba Üye Ekle</Text>
        </View>
        <FlatList
          data={notincludefriends}
          renderItem={({ item }) => (
            <AddNewMemberContainer friend={item} group={group} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity
          onPress={() =>
            setIsAddNewMembersModalVisible(!isAddNewMembersModalVisible)
          }
        >
          <Text>Kapat</Text>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default GroupLiveChatRoom;

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
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  groupInfoModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  groupInfoModalContent: {
    width: "80%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 10,
    justifyContent: "center",
    alignItems: "center",
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
  groupNameModalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  groupNameChangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 30,
  },
  addNewMembersModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
