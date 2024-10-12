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
