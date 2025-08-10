import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebase'; // Ajusta ruta según tu proyecto
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function AsignarUbicacion() {
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Al montar el componente, cargar la última ubicación guardada localmente o en Firestore
    const cargarUltimaUbicacion = async () => {
      setCargando(true);
      try {
        // Intentar cargar de AsyncStorage primero (local)
        const ubicacionLocal = await AsyncStorage.getItem('ultimaUbicacion');
        const direccionLocal = await AsyncStorage.getItem('ultimaDireccion');

        if (ubicacionLocal) {
          setUbicacion(JSON.parse(ubicacionLocal));
          setDireccion(direccionLocal || '');
          setCargando(false);
        } else if (auth.currentUser) {
          // Si no hay local, cargar desde Firestore
          const uid = auth.currentUser.uid;
          const docRef = doc(db, 'ubicacion', uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUbicacion({ latitude: data.latitud, longitude: data.longitud });
            setDireccion(data.direccion || '');
          }
          setCargando(false);
        } else {
          setCargando(false);
        }
      } catch (error) {
        console.error('Error cargando ubicación:', error);
        setCargando(false);
      }
    };

    cargarUltimaUbicacion();
  }, []);

  const obtenerYGuardarUbicacion = async () => {
    setCargando(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
      setCargando(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setUbicacion(location.coords);

      // Obtener dirección legible
      const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
      let direccionTexto = '';
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        direccionTexto = `${addr.name ? addr.name + ', ' : ''}${addr.street ? addr.street + ', ' : ''}${addr.city ? addr.city + ', ' : ''}${addr.region ? addr.region + ', ' : ''}${addr.postalCode ? addr.postalCode + ', ' : ''}${addr.country || ''}`;
        setDireccion(direccionTexto);
      }

      // Guardar en AsyncStorage localmente
      await AsyncStorage.setItem('ultimaUbicacion', JSON.stringify(location.coords));
      await AsyncStorage.setItem('ultimaDireccion', direccionTexto);

      // Guardar en Firestore con datos del usuario
      if (auth.currentUser) {
        const { uid, displayName, email } = auth.currentUser;
        const ubicacionRef = doc(db, 'ubicacion', uid);

        await setDoc(ubicacionRef, {
          uid,
          nombre: displayName || '',
          email: email || '',
          latitud: location.coords.latitude,
          longitud: location.coords.longitude,
          direccion: direccionTexto,
          fecha: serverTimestamp(),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener o guardar la ubicación');
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi Ubicación</Text>

      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E499DC" />
          <Text style={styles.texto}>Obteniendo ubicación...</Text>
        </View>
      ) : (
        <>
          {ubicacion ? (
            <>
              <Text style={styles.resultado}>
                Latitud: {ubicacion.latitude.toFixed(6)}
                {'\n'}
                Longitud: {ubicacion.longitude.toFixed(6)}
                {'\n'}
                Dirección: {direccion || 'No disponible'}
              </Text>

              <MapView
                style={styles.map}
                region={{
                  latitude: ubicacion.latitude,
                  longitude: ubicacion.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                provider="google"
              >
                <Marker
                  coordinate={{
                    latitude: ubicacion.latitude,
                    longitude: ubicacion.longitude,
                  }}
                  title="Tu ubicación"
                />
              </MapView>
            </>
          ) : (
            <Text style={styles.texto}>No se ha obtenido ubicación aún.</Text>
          )}

          <TouchableOpacity style={styles.boton} onPress={obtenerYGuardarUbicacion}>
            <Text style={styles.botonTexto}>Actualizar Ubicación</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#000',  // Aquí pones el fondo negro para igualar a otras interfaces
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E499DC',
    marginBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultado: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  texto: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
  },
  map: {
    width: Dimensions.get('window').width * 0.9,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: '#E499DC',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  botonTexto: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
