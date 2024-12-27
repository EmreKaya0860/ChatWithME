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
      <Text style={styles.friendUserName}>
        {friend.displayName || "Bilinmeyen Kullanıcı"}
      </Text>
      {group.adminId === auth.currentUser.uid && (
        <TouchableOpacity
          onPress={handleRemoveButton}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>Çıkar</Text>
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
      <Text style={styles.friendUserName}>
        {friend.displayName || "Bilinmeyen Kullanıcı"}
      </Text>
      <TouchableOpacity
        onPress={handlePressAddNewMemberButton}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Ekle</Text>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="navigate-before" size={35} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.groupNameContainer}
          onPress={() => setIsGroupInfoModalVisible(!isGroupInfoModalVisible)}
        >
          <MaterialIcons name="groups" size={35} color="#bb86fc" />
          {group.groupName && (
            <Text style={styles.groupNameText}>{group.groupName}</Text>
          )}
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
          placeholderTextColor="#aaa"
          style={styles.messageInput}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity onPress={sendMessages}>
          <MaterialIcons name="send" size={35} color="#bb86fc" />
        </TouchableOpacity>
      </View>
      <Modal visible={isGroupInfoModalVisible} transparent={true}>
        <View style={styles.groupInfoModalContainer}>
          <View style={styles.groupInfoModalContent}>
            <View>
              <Text style={styles.modalTitle}>Grup Bilgileri</Text>
              <View style={styles.groupNameModalContainer}>
                <Text style={styles.modalSubtitle}>Grup Adı: </Text>

                {isGroupNameEditable ? (
                  <View style={styles.groupNameChangeContainer}>
                    <TextInput
                      placeholder={group.groupName}
                      style={styles.inputArea}
                      onChangeText={(text) => setNewGroupName(text)}
                      placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity
                      onPress={() => setIsGroupNameEditable(false)}
                      style={styles.modalButton}
                    >
                      <Text style={styles.buttonText}>Vazgeç</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleChangeGroupName()}
                      style={styles.modalButton}
                    >
                      <Text style={styles.buttonText}>Değiştir</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.groupNameText}>{group.groupName}</Text>
                    {group.adminId === auth.currentUser.uid ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setIsGroupNameEditable(true)}
                        >
                          <MaterialIcons
                            name="edit-note"
                            size={30}
                            color="#bb86fc"
                          />
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </>
                )}
              </View>
              <Text style={styles.modalSubtitle}>Üyeler:</Text>
              <FlatList
                data={group.members}
                renderItem={({ item }) => (
                  <FriendsContainer friend={item} group={group} />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              {group.adminId === auth.currentUser.uid ? (
                <>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleAddNewMembers}
                  >
                    <Text style={styles.buttonText}>Gruba Üye Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton}>
                    <Text style={styles.buttonText}>Grubu Sil</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handlePressLeaveGroupButton}
                >
                  <Text style={styles.buttonText}>Grubu Terk Et</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() =>
                  setIsGroupInfoModalVisible(!isGroupInfoModalVisible)
                }
                style={styles.modalButton}
              >
                <Text style={styles.buttonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isAddNewMembersModalVisible} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.addNewMembersModalContainer}>
            <Text style={styles.modalTitle}>Gruba Üye Ekle</Text>
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
              style={styles.modalButton}
            >
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GroupLiveChatRoom;

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
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  groupNameText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexGrow: 1,
    justifyContent: "flex-end",
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
  groupInfoModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  groupInfoModalContent: {
    width: 350,
    padding: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },
  groupNameModalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "90%",
    backgroundColor: "#3D3D3D",
    marginBottom: 10,
  },
  groupNameChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    flexWrap: "wrap",
  },
  inputArea: {
    backgroundColor: "#3D3D3D",
    borderRadius: 5,
    padding: 10,
    color: "#fff",
    marginRight: 10,
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#bb86fc",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    display: "flex",
    alignItems: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  addNewMembersModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  friendUserContainer: {
    width: 300,
    padding: 15,
    backgroundColor: "#3D3D3D",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 10,
  },
  friendUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  friendUserName: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  addButton: {
    backgroundColor: "#bb86fc",
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#bb86fc",
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  addNewMembersModalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#bb86fc",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

// headerContainer: {
//   flexDirection: "row",
//   alignItems: "center",
//   padding: 10,
//   elevation: 2,
//   gap: 30,
//   backgroundColor: "white",
// },
// chatUserImage: {
//   width: 50,
//   height: 50,
//   borderRadius: 50,
// },
// messagesContainer: {
//   paddingHorizontal: 10,
//   paddingVertical: 5,
//   flexGrow: 1,
//   justifyContent: "flex-end",
// },
// messageContainer: {
//   maxWidth: "70%",
//   borderRadius: 10,
//   padding: 10,
//   marginVertical: 5,
// },
// myMessage: {
//   backgroundColor: "#DCF8C6",
//   alignSelf: "flex-end",
// },
// friendMessage: {
//   backgroundColor: "#ECECEC",
//   alignSelf: "flex-start",
// },
// senderName: {
//   fontWeight: "bold",
//   marginBottom: 5,
// },
// messageText: {
//   fontSize: 16,
// },
// inputContainer: {
//   flexDirection: "row",
//   alignItems: "center",
//   padding: 10,
//   backgroundColor: "white",
// },
// messageInput: {
//   flex: 1,
//   padding: 10,
//   backgroundColor: "#F2F2F2",
//   borderRadius: 20,
//   marginRight: 10,
// },
// groupNameContainer: {
//   flexDirection: "row",
//   alignItems: "center",
//   gap: 10,
//   flex: 1,
// },
// groupInfoModalContainer: {
//   flex: 1,
//   justifyContent: "center",
//   alignItems: "center",
//   backgroundColor: "rgba(0,0,0,0.2)",
// },
// groupInfoModalContent: {
//   width: "80%",
//   height: "80%",
//   backgroundColor: "white",
//   borderRadius: 20,
//   elevation: 10,
//   justifyContent: "center",
//   alignItems: "center",
// },
// friendUserContainer: {
//   width: "100%",
//   height: 50,
//   backgroundColor: "yellow",
//   padding: 10,
//   display: "flex",
//   flexDirection: "row",
//   alignItems: "center",
//   gap: 50,
//   marginVertical: 5,
// },
// friendUserImage: {
//   width: 50,
//   height: 50,
//   borderRadius: 50,
// },
// groupNameModalContainer: {
//   flexDirection: "row",
//   justifyContent: "space-between",
// },
// groupNameChangeContainer: {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   gap: 30,
// },
// addNewMembersModalContainer: {
//   flex: 1,
//   justifyContent: "center",
//   alignItems: "center",
// },
