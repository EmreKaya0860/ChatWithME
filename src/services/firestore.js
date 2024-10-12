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
