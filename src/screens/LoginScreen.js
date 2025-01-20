import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator  } from "react-native";
import { Input, Button, Text } from "react-native-elements";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { LogBox } from 'react-native';
// Ignorar las advertencias específicas
LogBox.ignoreLogs(['Warning: TextElement: Support for defaultProps will be removed']);
export default function LoginScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false)
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
     } 
    catch (error) {
      setError(error.message);
    }finally {
      setIsLoading(false); 
     }
  };
    
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const validateLoginForm = () => {
    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    const isPasswordValid = password.length > 0;
    return isEmailValid && isPasswordValid;
    };
  
  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>
        Mi Comida Favorita
      </Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Iniciar Sesión"
          disabled={!validateLoginForm()}
          onPress={handleLogin}
          containerStyle={styles.button}
        />
      )}
      <Button
        title="Registrarse"
        type="outline"
        onPress={() => navigation.navigate("Register")}
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
