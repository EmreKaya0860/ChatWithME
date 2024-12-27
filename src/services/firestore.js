import { auth } from "./authentication";
import { app } from "./firebaseconfig";
import {
  getFirestore,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

export const db = getFirestore(app);

export const addData = async (collectionName, data) => {
  try {
    await addDoc(collection(db, collectionName), data);
    return "Data added successfully";
  } catch (error) {
    return error.message;
  }
};

const usersRef = collection(db, "users");

export const getUserData = async (userID) => {
  try {
    const userData = [];
    const q = query(usersRef, where("userId", "==", userID));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      userData.push(doc.data(), { docId: doc.id });
    });
    return userData;
  } catch (error) {
    return error.message;
  }
};

export const getUserDataWithEmail = async (email) => {
  try {
    const userData = [];
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      userData.push(doc.data(), { docId: doc.id });
    });
    return userData;
  } catch (error) {
    return error.message;
  }
};

export const updateUserData = async (docID, updatedData) => {
  try {
    const userDoc = doc(db, "users", docID);
    console.log("userDoc: ", userDoc);
    await updateDoc(userDoc, updatedData);
    return "User data updated successfully!";
  } catch (error) {
    console.error("Error updating user data: ", error);
    return error.message;
  }
};

export const sendFriendRequest = async (
  senderDocId,
  receiverDocId,
  sender,
  receiver
) => {
  try {
    const senderDoc = doc(db, "users", senderDocId);
    const receiverDoc = doc(db, "users", receiverDocId);

    const isAlreadyFriend = receiver.friends?.includes(sender.email);
    if (isAlreadyFriend) {
      return {
        success: false,
        message: "Bu kullanıcı ile zaten arkadaşsınız.",
      };
    }

    const isRequestAlreadySent = receiver.pendingFriendRequests?.includes(
      sender.email
    );
    if (isRequestAlreadySent) {
      return {
        success: false,
        message: "Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.",
      };
    }

    await updateDoc(senderDoc, {
      sentFriendRequests: arrayUnion(receiver.email),
    });

    await updateDoc(receiverDoc, {
      pendingFriendRequests: arrayUnion(sender.email),
    });

    return {
      success: true,
      message: "Arkadaşlık isteği başarıyla gönderildi.",
    };
  } catch (error) {
    console.error("Error sending friend request: ", error);
    return { success: false, message: "Bir hata oluştu." };
  }
};

export const getPendingFriendRequests = async () => {
  try {
    const userData = await getUserData(auth.currentUser.uid);
    const { pendingFriendRequests } = userData[0];
    if (!pendingFriendRequests || pendingFriendRequests.length === 0) {
      return [];
    }
    const firendRequestsUsersData = [];
    for (const friendRequestUserEmail of pendingFriendRequests) {
      const friendRequestUserData = await getUserDataWithEmail(
        friendRequestUserEmail
      );

      firendRequestsUsersData.push(friendRequestUserData[0]);
    }
    return firendRequestsUsersData;
  } catch (error) {
    console.error("Error getting pending friend requests: ", error);
    return "Bir hata oluştu.";
  }
};

export const getFriends = async () => {
  try {
    const userData = await getUserData(auth.currentUser.uid);
    const { friends } = userData[0];
    if (!friends || friends.length === 0) {
      return [];
    }
    const friendsData = [];
    for (const friendEmail of friends) {
      const friendData = await getUserDataWithEmail(friendEmail);
      friendsData.push(friendData[0]);
    }
    return friendsData;
  } catch (error) {
    console.error("Error getting friends: ", error);
    return "Bir hata oluştu.";
  }
};

export const removeFriend = async (
  friendEmail,
  friendDocId,
  currentUserEmail,
  currentUserDocId,
  status
) => {
  try {
    const friendDoc = doc(db, "users", friendDocId);
    const currentUserDoc = doc(db, "users", currentUserDocId);

    if (status) {
      await updateDoc(friendDoc, {
        friends: arrayRemove(currentUserEmail),
      });

      await updateDoc(currentUserDoc, {
        friends: arrayRemove(friendEmail),
      });
      return {
        success: true,
        message: "Arkadaş başarıyla silindi.",
      };
    } else {
      return {
        success: false,
        message: "Arkadaş silme işlemi iptal edildi.",
      };
    }
  } catch (error) {
    console.error("Error removing friend: ", error);
    return { success: false, message: "Bir hata oluştu." };
  }
};

export const updatePendingFriendRequests = async (
  senderEmail,
  senderDocId,
  receiverEmail,
  receiverDocId,
  status
) => {
  try {
    const senderDoc = doc(db, "users", senderDocId);
    const receiverDoc = doc(db, "users", receiverDocId);

    if (status) {
      await updateDoc(senderDoc, {
        friends: arrayUnion(receiverEmail),
        sentFriendRequests: arrayRemove(receiverEmail),
      });

      await updateDoc(receiverDoc, {
        friends: arrayUnion(senderEmail),
        pendingFriendRequests: arrayRemove(senderEmail),
      });
    } else {
      await updateDoc(senderDoc, {
        sentFriendRequests: arrayRemove(receiverEmail),
      });

      await updateDoc(receiverDoc, {
        pendingFriendRequests: arrayRemove(senderEmail),
      });
    }

    return {
      success: true,
      message: "Arkadaşlık isteği başarıyla güncellendi.",
    };
  } catch (error) {
    console.error("Error updating pending friend requests: ", error);
    return { success: false, message: "Bir hata oluştu." };
  }
};

export const handleDeleteAccountDocument = async (docId, email) => {
  try {
    await deleteDoc(doc(db, "users", docId));
    await removeFromOtherUsersFriends(email);
    return "Account document deleted successfully!";
  } catch (error) {
    console.error("Error deleting account document: ", error);
    return error.message;
  }
};

const removeFromOtherUsersFriends = async (email) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("friends", "array-contains", email));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        friends: arrayRemove(email),
      })
    );

    await Promise.all(updates);
    console.log("Kullanıcı diğer arkadaşların listesinden silindi.");
  } catch (error) {
    console.error("Error removing from friends lists: ", error);
    throw error;
  }
};
