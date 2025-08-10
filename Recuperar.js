import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import * as Animatable from 'react-native-animatable';

export default function Recuperar() {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) {
      Alert.alert('Campo vacío', 'Introduce tu correo electrónico');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(
          'Correo enviado',
          'Hemos enviado instrucciones a tu correo. Revisa tu bandeja de entrada o spam.'
        );
      })
      .catch((error) => {
        let mensaje = '';
        switch (error.code) {
          case 'auth/user-not-found':
            mensaje = 'Ese correo no está registrado.';
            break;
          case 'auth/invalid-email':
            mensaje = 'El formato del correo es inválido.';
            break;
          default:
            mensaje = 'Ocurrió un error. Intenta de nuevo.';
            break;
        }
        Alert.alert('Error', mensaje);
      });
  };

  return (
    <View style={styles.container}>
      {/* Logo animado */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Image source={require('./imag/image0_large.jpg')} style={styles.logo} />
        <Text style={styles.title}>𝓒𝓮𝓷𝓽𝓻𝓸 𝓓𝓻𝓲𝓷𝓴𝓼</Text>
      </Animatable.View>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Ionicons name="mail-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Enviar instrucciones</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgb(228, 153, 220)',
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    borderWidth: 2,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 50, 114, 0.97)',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
