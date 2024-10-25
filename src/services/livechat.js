import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "@firebase/firestore";

import { db } from "./firestore";

import { auth } from "./authentication";

import { getUserData, updateUserData } from "./firestore";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export const createSingleChat = async (friend) => {
  const chat = {
    id: uuidv4(),
    members: [auth.currentUser.uid, friend.userId],
    messages: [],
  };
  console.log(chat);
  await setDoc(doc(db, "singleChats", chat.id), chat);
  console.log("Chat created successfully " + chat.id);
  return chat.id;
};

export const getSingleChatMessages = async (friend, setOldMessages) => {
  try {
    const q = query(
      collection(db, "singleChats"),
      where("members", "array-contains", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    let chatData = null;
    let singleChatDocumentRef = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // İki üyeyi de kontrol ederek doğru sohbeti bul
      if (data.members.includes(friend.userId)) {
        chatData = data;
        onSnapshot(doc.ref, (doc) => {
          console.log("Current data: ", doc.data().messages);
          setOldMessages(doc.data().messages);
        });
      }
    });

    if (chatData) {
      console.log("Mesajlar:", chatData.messages);
      return chatData.messages;
    } else {
      console.log("Bu kullanıcıyla bir sohbet bulunamadı.");
      await createSingleChat(friend);
      return [];
    }
  } catch (error) {
    console.error("Mesajları alırken hata:", error);
    return [];
  }
};

export const sendMessage = async (friend, text) => {
  try {
    const q = query(
      collection(db, "singleChats"),
      where("members", "array-contains", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    let chatId = null;

    // Sohbetin olup olmadığını kontrol et
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.members.includes(friend.userId)) {
        chatId = doc.id; // Sohbetin id'sini sakla
      }
    });

    if (!chatId) {
      console.log("Bu kullanıcıyla bir sohbet bulunamadı.");
      return;
    }

    // Mesaj verisi oluştur
    const newMessage = {
      senderId: auth.currentUser.uid,
      text,
      sendTime: Timestamp.now(),
    };

    // Firestore'daki ilgili sohbetin `messages` alanına mesaj ekle
    const chatDocRef = doc(db, "singleChats", chatId);
    await updateDoc(chatDocRef, {
      messages: arrayUnion(newMessage),
    });

    console.log("Mesaj başarıyla gönderildi!");
  } catch (error) {
    console.error("Mesaj gönderirken hata oluştu:", error);
  }
};

export const createGroupChat = async (name, members) => {
  const groupChat = {
    id: uuidv4(),
    groupName: name,
    members: members,
    messages: [],
    adminId: auth.currentUser.uid,
  };

  console.log(groupChat);

  const currentUser = await getUserData(auth.currentUser.uid);

  groupChat.members = [...groupChat.members, currentUser[0]];

  groupChat.members.forEach(async (member) => {
    const user = await getUserData(member.userId);
    const userDocId = user[1].docId;

    console.log(member.displayName);
    console.log("UserDocId: ", userDocId);

    await updateUserData(userDocId, {
      groupChats: arrayUnion({
        id: groupChat.id,
        groupName: groupChat.groupName,
      }),
    });
  });

  await setDoc(doc(db, "groupChats", groupChat.id), groupChat);

  console.log("Group chat created successfully " + groupChat.id);
  return groupChat.id;
};

export const getJoinedGroups = async () => {
  try {
    const user = await getUserData(auth.currentUser.uid);
    const joinedGroupChats = user[0].groupChats;
    var joinedGroups = [];
    var docRef;
    var docSnap;

    joinedGroupChats.forEach(async (element) => {
      docRef = doc(db, "groupChats", element.id);
      docSnap = await getDoc(docRef);
      joinedGroups.push(docSnap.data());
    });

    return joinedGroups;
  } catch (error) {
    console.error("Grup sohbetlerini alırken hata:", error);

    return [];
  }
};

export const sendGroupMessage = async (group, text) => {
  try {
    const currentUser = await getUserData(auth.currentUser.uid);
    const newMessage = {
      senderId: auth.currentUser.uid,
      senderName: currentUser[0].displayName,
      text,
      sendTime: Timestamp.now(),
    };

    const chatDocRef = doc(db, "groupChats", group.id);
    await updateDoc(chatDocRef, {
      messages: arrayUnion(newMessage),
    });

    console.log("Mesaj başarıyla gönderildi!");
  } catch (error) {
    console.error("Mesaj gönderirken hata oluştu:", error);
  }
};

export const getGroupChatMessages = async (group, setOldMessages) => {
  try {
    const docRef = doc(db, "groupChats", group.id);
    const docSnap = await getDoc(docRef);

    onSnapshot(docRef, (doc) => {
      console.log("Current data: ", doc.data().messages);
      setOldMessages(doc.data().messages);
    });

    return docSnap.data().messages;
  } catch (error) {
    console.error("Mesajları alırken hata:", error);
    return [];
  }
};

export const removeFriendFromGroup = async (group, friend) => {
  try {
    const chatDocRef = doc(db, "groupChats", group.id);
    await updateDoc(chatDocRef, {
      members: arrayRemove(friend),
    });
    const user = await getUserData(friend.userId);
    const userDocId = user[1].docId;
    await updateUserData(userDocId, {
      groupChats: arrayRemove({
        id: group.id,
        groupName: group.groupName,
      }),
    });
    console.log("Arkadaş başarıyla gruptan çıkarıldı!");
  } catch (error) {
    console.error("Arkadaşı gruptan çıkarırken hata oluştu:", error);
  }
};

export const addFriendToGroup = async (group, friend) => {
  try {
    const chatDocRef = doc(db, "groupChats", group.id);
    await updateDoc(chatDocRef, {
      members: arrayUnion(friend),
    });
    const user = await getUserData(friend.userId);
    const userDocId = user[1].docId;
    await updateUserData(userDocId, {
      groupChats: arrayUnion({
        id: group.id,
        groupName: group.groupName,
      }),
    });
    console.log("Arkadaş başarıyla gruba eklendi!");
  } catch (error) {
    console.error("Arkadaşı gruba eklerken hata oluştu:", error);
  }
};

export const changeGroupName = async (group, newName) => {
  try {
    const chatDocRef = doc(db, "groupChats", group.id);
    await updateDoc(chatDocRef, {
      groupName: newName,
    });
    console.log("Grup adı başarıyla değiştirildi!");
  } catch (error) {
    console.error("Grup adını değiştirirken hata oluştu:", error);
  }
};

export const leaveGroup = async (group) => {
  try {
    const chatDocRef = doc(db, "groupChats", group.id);
    const currentUser = await getUserData(auth.currentUser.uid);

    await updateDoc(chatDocRef, {
      members: arrayRemove(),
    });

    // const userDocId = user[1].docId;
    // await updateUserData(userDocId, {
    //   groupChats: arrayRemove({
    //     id: group.id,
    //     groupName: group.groupName,
    //   }),
    // });
    console.log("Grup başarıyla terk edildi!");
  } catch (error) {
    console.error("Grubu terk ederken hata oluştu:", error);
  }
};
