import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function Registro() {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [apodo, setApodo] = useState('');
  const [calle, setCalle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [referencia, setReferencia] = useState('');

  const handleRegister = async () => {
    if (!nombre || !edad || !email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios.');
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'registro', user.uid), {
          uid: user.uid,
          nombre,
          edad,
          apodo,
          calle,
          email,
          telefono,
          referencia,
          creado: new Date(),
        });

        Alert.alert('Registro exitoso', `Bienvenido/a, ${nombre}`);
        navigation.navigate('Login');
      } catch (error) {
        let mensaje = '';
        switch (error.code) {
          case 'auth/email-already-in-use':
            mensaje = 'El correo ya está en uso.';
            break;
          case 'auth/invalid-email':
            mensaje = 'Correo inválido.';
            break;
          case 'auth/weak-password':
            mensaje = 'La contraseña debe tener al menos 6 caracteres.';
            break;
          default:
            mensaje = 'Error al registrar usuario.';
            break;
        }
        Alert.alert('Error', mensaje);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // ajusta si tienes header
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo animado */}
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <Image source={require('./imag/image0_large.jpg')} style={styles.logo} />
            <Text style={styles.title}>𝓒𝓮𝓷𝓽𝓻𝓸 𝓓𝓻𝓲𝓷𝓴𝓼</Text>
          </Animatable.View>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#ccc"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Apodo o sobrenombre"
            placeholderTextColor="#ccc"
            value={apodo}
            onChangeText={setApodo}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />
          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            placeholderTextColor="#ccc"
            keyboardType="phone-pad"
            value={telefono}
            onChangeText={setTelefono}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Calle"
            placeholderTextColor="#ccc"
            value={calle}
            onChangeText={setCalle}
          />
          <TextInput
            style={styles.input}
            placeholder="Referencia de ubicación (ej: Frente a tienda Dany)"
            placeholderTextColor="#ccc"
            value={referencia}
            onChangeText={setReferencia}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Ionicons name="person-add-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  container: {
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
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
