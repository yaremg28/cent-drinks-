import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Campos Vacíos', 'Por favor llena todos los campos');
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          navigation.navigate('Menu');
        })
        .catch((error) => {
          let mensaje = '';
          switch (error.code) {
            case 'auth/user-not-found':
              mensaje = 'Usuario no encontrado.';
              break;
            case 'auth/wrong-password':
              mensaje = 'Contraseña incorrecta.';
              break;
            case 'auth/invalid-email':
              mensaje = 'Correo inválido.';
              break;
            default:
              mensaje = 'Error al iniciar sesión.';
              break;
          }
          Alert.alert('Error', mensaje);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Image source={require('./imag/image0_large.jpg')} style={styles.logo} />
        <Text style={styles.title}>𝓒𝓮𝓷𝓽𝓻𝓸 𝓓𝓻𝓲𝓷𝓴𝓼</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400} style={styles.form}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="log-in-outline" size={24} color="white" />
          <Text style={styles.loginText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Recuperar')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.Text animation="fadeInUp" delay={700} style={styles.footer}>
        © 2025 Centro Drinks
      </Animatable.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
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
  form: {
    paddingHorizontal: 30,
  },
  label: {
    color: 'rgb(228, 153, 220)',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '600',
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 50, 114, 0.97)',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  forgotText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#E499DC',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
});
