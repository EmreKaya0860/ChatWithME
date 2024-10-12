import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { auth } from "../services/authentication";
import { uploadProfileImage } from "../services/storage";
import { updateUserData } from "../services/firestore";

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
    navigation.navigate("HomeScreen");
  };

  useEffect(() => {
    setImage(profileImageURL);
  }, [profileImageURL]);

  return (
    <View style={styles.container}>
      <Text>SetImage</Text>
      <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <Text>sss</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.selectImageFromContainer}>
          <View style={styles.selectImageOptionsContainer}>
            <Text>Profil Fotoğrafını Nereden Yüklemek İstersiniz?</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.selectImageOptionContainer}
                onPress={() => pickImage("camera")}
              >
                <FontAwesome name="camera" size={24} color="black" />
                <Text>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectImageOptionContainer}
                onPress={() => pickImage("gallery")}
              >
                <FontAwesome name="file-image-o" size={24} color="black" />
                <Text>Galeri</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
              <Text>Kapat</Text>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  selectImageFromContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flex: 1,
    bottom: 0,
  },
  selectImageOptionsContainer: {
    height: 200,
    backgroundColor: "white",
    display: "flex",
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    bottom: 0,
    borderRadius: 10,
    gap: 20,
  },
  selectImageOptionContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  optionsContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
});
