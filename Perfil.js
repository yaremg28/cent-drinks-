import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { auth } from './firebase'; // Tu configuración Firebase
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

// Firestore imports
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase Storage imports
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Image picker
import { launchImageLibrary } from 'react-native-image-picker';

const db = getFirestore();
const storage = getStorage();

export default function Perfil() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);       // Usuario Auth
  const [profile, setProfile] = useState({
    nombre: '',
    edad: '',
    apodo: '',
    calle: '',
    telefono: '',
    referencia: '',
    fotoURL: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (usr) => {
      if (usr) {
        setUser(usr);
        try {
          const docRef = doc(db, 'registro', usr.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile({
              nombre: docSnap.data().nombre || '',
              edad: docSnap.data().edad || '',
              apodo: docSnap.data().apodo || '',
              calle: docSnap.data().calle || '',
              telefono: docSnap.data().telefono || '',
              referencia: docSnap.data().referencia || '',
              fotoURL: docSnap.data().fotoURL || '',
            });
          } else {
            // documento no existe, perfil vacío
            setProfile({
              nombre: '',
              edad: '',
              apodo: '',
              calle: '',
              telefono: '',
              referencia: '',
              fotoURL: '',
            });
          }
        } catch (error) {
          Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
          setProfile({
            nombre: '',
            edad: '',
            apodo: '',
            calle: '',
            telefono: '',
            referencia: '',
            fotoURL: '',
          });
        }
        setLoading(false);
      } else {
        setLoading(false);
        navigation.navigate('Login');
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
  signOut(auth)
    .then(() => {
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], 
      });
    })
    .catch(() => {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    });
};


  // Selector de imagen
  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.7,
      },
      async (response) => {
        if (response.didCancel) {
          // Usuario canceló
          return;
        } else if (response.errorCode) {
          Alert.alert('Error', 'Error al seleccionar imagen: ' + response.errorMessage);
          return;
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri) {
            // Subir imagen a Firebase Storage
            await uploadImage(asset.uri);
          }
        }
      }
    );
  };

  const uploadImage = async (uri) => {
    setSaving(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `perfil/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setProfile((prev) => ({ ...prev, fotoURL: url }));
      Alert.alert('Éxito', 'Imagen subida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la imagen.');
    }
    setSaving(false);
  };

  const handleSave = async () => {
    // Validar datos básicos (opcional)
    if (profile.nombre.trim() === '') {
      Alert.alert('Validación', 'El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'registro', user.uid);
      await setDoc(docRef, profile, { merge: true });
      Alert.alert('Éxito', 'Datos guardados correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los datos');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E499DC" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Usuario no logueado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Perfil de Usuario</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
        {profile.fotoURL ? (
          <Image source={{ uri: profile.fotoURL }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Toca para agregar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        value={profile.nombre}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, nombre: text }))}
        placeholder="Nombre"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Edad:</Text>
      <TextInput
        style={styles.input}
        value={profile.edad}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, edad: text }))}
        placeholder="Edad"
        keyboardType="numeric"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Apodo:</Text>
      <TextInput
        style={styles.input}
        value={profile.apodo}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, apodo: text }))}
        placeholder="Apodo"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Calle:</Text>
      <TextInput
        style={styles.input}
        value={profile.calle}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, calle: text }))}
        placeholder="Calle"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Teléfono:</Text>
      <TextInput
        style={styles.input}
        value={profile.telefono}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, telefono: text }))}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Referencia:</Text>
      <TextInput
        style={styles.input}
        value={profile.referencia}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, referencia: text }))}
        placeholder="Referencia"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Email:</Text>
      <Text style={[styles.info, { marginBottom: 20 }]}>{user.email}</Text>

      <TouchableOpacity
        style={[styles.saveButton, saving && { backgroundColor: 'gray' }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'flex-start',
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'rgb(228, 153, 220)',
    marginBottom: 30,
    textAlign: 'center',
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 75,
    overflow: 'hidden',
    width: 150,
    height: 150,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  label: {
    color: 'rgb(228, 153, 220)',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    borderWidth: 2,
  },
  info: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(4, 50, 114, 0.97)',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(180, 0, 0, 0.9)',
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
