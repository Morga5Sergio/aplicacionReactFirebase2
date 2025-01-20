import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Input, Button, Text } from "react-native-elements";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { LogBox } from 'react-native';

// Ignorar las advertencias específicas
LogBox.ignoreLogs(['Warning: TextElement: Support for defaultProps will be removed']);
LogBox.ignoreLogs(['Warning: Text strings must be rendered within a <Text> component.']);

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [error, setError] = useState(""); // Mensaje global de error
  const [fieldErrors, setFieldErrors] = useState({}); // Errores por campo
  const [isLoading, setIsLoading] = useState(false); // Estado para el spinner

  const handleRegister = async () => {
    setIsLoading(true); // Activar el spinner
    const errors = validateForm(); // Obtener los errores de validación

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors); // Establecer los errores por campo
      setError(""); // Limpiar el mensaje global de error
      setIsLoading(false); // Desactivar el spinner cuando hay errores
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      navigation.replace("Home");
    } catch (error) {
      setError("Error al registrarse: " + error.message);
      setFieldErrors({}); // Limpiar errores de campo
    } finally {
      setIsLoading(false); // Desactivar el spinner al finalizar el proceso
    }
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!email) errors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email inválido";
    
    if (!password) errors.password = "La contraseña es requerida";
    else if (!validatePassword(password)) {
      errors.password = "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";
    }
    
    if (password !== confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";
    
    return errors;
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>
        Registro
      </Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        errorMessage={fieldErrors.email || ""}  // Mostrar error específico para email
      />
      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        errorMessage={fieldErrors.password || ""}  // Mostrar error específico para contraseña
      />
      <Input
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        errorMessage={fieldErrors.confirmPassword || ""}  // Mostrar error específico para confirmación de contraseña
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}  {/* Mostrar mensaje de error global */}

      {/* Mostrar spinner mientras isLoading es true */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Registrarse"
          onPress={handleRegister}
          disabled={isLoading} // Desactivar el botón mientras se registra
          containerStyle={styles.button}
        />
      )}

      <Button
        title="Volver al Login"
        type="outline"
        onPress={() => navigation.navigate("Login")}
        containerStyle={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    marginVertical: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});