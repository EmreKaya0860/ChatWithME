import { app } from "./firebaseconfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const storage = getStorage(app);

export const uploadProfileImage = async (image, userId) => {
  if (!image || !userId) {
    throw new Error("Image or userId is missing");
  }

  try {
    const profileImageStorageRef = ref(storage, `ProfileImages/${userId}`);
    console.log("profileImageStorageRef: ", profileImageStorageRef);

    const snapshot = await uploadBytes(profileImageStorageRef, image);
    console.log("Uploaded a blob or file!", snapshot);

    const downloadURL = await getDownloadURL(profileImageStorageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading the profile image: ", error);
    throw error;
  }
};

export const uploadChatFile = async (file) => {
  if (!file) {
    throw new Error("File or chatId is missing");
  }

  try {
    const fileName = `${Date.now()}_${file}`;
    const chatFileStorageRef = ref(storage, `ChatFiles/${fileName}`);

    console.log("chatFileStorageRef: ", chatFileStorageRef);

    const snapshot = await uploadBytes(chatFileStorageRef, file);
    console.log("Uploaded a blob or file!", snapshot);

    const downloadURL = await getDownloadURL(chatFileStorageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading the chat file: ", error);
    throw error;
  }
};
