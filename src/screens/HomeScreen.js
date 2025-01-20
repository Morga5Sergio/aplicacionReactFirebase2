import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Input, Button, Text } from "react-native-elements";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { LogBox } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import * as FileSystem from "expo-file-system";
// Ignorar las advertencias específicas
LogBox.ignoreLogs([
  "Warning: TextElement: Support for defaultProps will be removed",
]);

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState({
    nombre: "",
    apellido: "",
    comidaFavorita: "",
    photoURL: "", // Para almacenar la URL de la foto
  });
  const [isLoading, setIsLoading] = useState(false); // Estado para el spinner de carga
  const [localImage, setLocalImage] = useState(""); // Para manejar la foto local temporalmente

  useEffect(() => {
    loadProfile();
     // Solicitar permisos de la galería y cámara
    requestPermission();
  }, []);

  const loadProfile = async () => {
    try {
      const docRef = doc(db, "usuarios", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  };

  const requestPermission = async () => {
    const { status: galleryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  
    if (galleryStatus !== "granted" || cameraStatus !== "granted") {
      alert("Se necesitan permisos para acceder a la galería y la cámara");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  
    if (!result.canceled) {
      // Asegúrate de acceder al URI correctamente
      const uri = result.assets[0].uri; // Accede al URI de la imagen seleccionada
      setLocalImage(uri); // Actualizar la imagen local
      await uploadImage(uri); // Subir la imagen
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  
    if (!result.canceled) {
      // Asegúrate de acceder al URI correctamente
      const uri = result.assets[0].uri; // Accede al URI de la foto tomada
      setLocalImage(uri); // Actualizar la imagen local
      await uploadImage(uri); // Subir la imagen
    }
  };

  const uploadImage = async (uri) => {
    try {
      setIsLoading(true);
  
      // Obtener el blob desde la URI
      const response = await fetch(uri);
      const blob = await response.blob();
  
      // Crear una referencia en Firebase Storage
      const storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
  
      // Subir el blob a Firebase Storage
      await uploadBytes(storageRef, blob);
  
      // Obtener la URL de descarga
      const url = await getDownloadURL(storageRef);
  
      // Actualizar Firestore con la URL de la imagen
      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
        photoURL: url,
      });
  
      // Actualizar el estado del perfil
      setProfile((prevProfile) => ({ ...prevProfile, photoURL: url }));
      setLocalImage("");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("Ocurrió un error al subir la imagen. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await setDoc(doc(db, "usuarios", auth.currentUser.uid), profile);
      alert("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al actualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>
        Mi Perfil
      </Text>

      {/* Mostrar la imagen de perfil si existe o la imagen local tomada */}
      {localImage || profile.photoURL ? (
        <Image
          source={{ uri: localImage || profile.photoURL }}
          style={styles.profileImage}
        />
      ) : (
        <Text style={styles.noImageText}>No hay imagen de perfil</Text>
      )}

      <Button title="Seleccionar Imagen de la Galería" onPress={pickImage} />
      <Button title="Tomar Foto" onPress={takePhoto} />

      <Input
        placeholder="Nombre"
        value={profile.nombre}
        onChangeText={(text) => setProfile({ ...profile, nombre: text })}
      />
      <Input
        placeholder="Apellido"
        value={profile.apellido}
        onChangeText={(text) => setProfile({ ...profile, apellido: text })}
      />
      <Input
        placeholder="Comida Favorita"
        value={profile.comidaFavorita}
        onChangeText={(text) =>
          setProfile({ ...profile, comidaFavorita: text })
        }
      />

      {/* Mostrar spinner mientras isLoading es true */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Actualizar Perfil"
          onPress={handleUpdate}
          disabled={isLoading} // Desactivar el botón mientras se actualiza
          containerStyle={styles.button}
        />
      )}
      <Button
        title="Cerrar Sesión"
        type="outline"
        onPress={handleSignOut}
        containerStyle={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    marginVertical: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 20,
  },
  noImageText: {
    textAlign: "center",
    marginBottom: 20,
  },
});