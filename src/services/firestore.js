import { app } from "./firebaseconfig";
import {
  getFirestore,
  addDoc,
  collection,
  query,
  where,
  getDocs,
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
      userData.push(doc.data());
    });
    return userData;
  } catch (error) {
    return error.message;
  }
};
