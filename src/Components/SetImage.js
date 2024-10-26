import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../services/authentication";
import { updateUserData } from "../services/firestore";
import { uploadProfileImage } from "../services/storage";

const SetImage = ({ docId, profileImageURL, navigation }) => {
  const [image, setImage] = useState(profileImageURL);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async (selection) => {
    var result;
    if (selection === "camera") {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        alert("Kamera izni verilmedi!");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
    if (selection === "gallery") {
      const galleryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!galleryPermission.granted) {
        alert("Galeri izni verilmedi!");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
    if (!result.canceled) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const userId = auth.currentUser.uid;
      const downloadUrl = await uploadProfileImage(blob, userId);
      const updatedData = { profileImage: downloadUrl };
      await updateUserData(docId, updatedData);
    }
    setModalVisible(!modalVisible);
    navigation.navigate("SingleChatScreen");
  };

  useEffect(() => {
    setImage(profileImageURL);
  }, [profileImageURL]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <Text style={styles.changePhotoText}>Profil Fotoğrafını Değiştir</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.selectImageFromContainer}>
          <View style={styles.selectImageOptionsContainer}>
            <Text style={styles.modalTitle}>
              Profil Fotoğrafını Nereden Yüklemek İstersiniz?
            </Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.selectImageOptionContainer}
                onPress={() => pickImage("camera")}
              >
                <FontAwesome name="camera" size={24} color="#bb86fc" />
                <Text style={styles.optionText}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectImageOptionContainer}
                onPress={() => pickImage("gallery")}
              >
                <FontAwesome name="file-image-o" size={24} color="#bb86fc" />
                <Text style={styles.optionText}>Galeri</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SetImage;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
    padding: 20,
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoText: {
    color: "#bb86fc",
    fontWeight: "bold",
    textAlign: "center",
  },
  selectImageFromContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "flex-end",
  },
  selectImageOptionsContainer: {
    backgroundColor: "#3D3D3D",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  selectImageOptionContainer: {
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    marginTop: 5,
  },
  closeText: {
    color: "#bb86fc",
    marginTop: 20,
  },
});
