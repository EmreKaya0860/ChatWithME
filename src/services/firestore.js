import { app } from "./firebaseconfig";
import { getFirestore, addDoc, collection } from "firebase/firestore";

export const db = getFirestore(app);

export const addData = async (collectionName, data) => {
  try {
    await addDoc(collection(db, collectionName), data);
    return "Data added successfully";
  } catch (error) {
    return error.message;
  }
};
