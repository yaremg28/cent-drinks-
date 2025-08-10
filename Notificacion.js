import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null); // Dirección texto
  const [repartidorLocation, setRepartidorLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const uid = auth.currentUser.uid;

        const q = query(collection(db, 'pedidos'), where('uid', '==', uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const pedidosData = [];
          querySnapshot.forEach((doc) => {
            pedidosData.push({ ...doc.data(), id: doc.id });
          });
          setPedidos(pedidosData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error cargando datos:', error);
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);

      // Obtener dirección legible de la ubicación
      const reverseGeocode = await Location.reverseGeocodeAsync(coords);
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const direccionTexto = `${addr.name ? addr.name + ', ' : ''}${addr.street ? addr.street + ', ' : ''}${addr.city ? addr.city + ', ' : ''}${addr.region ? addr.region + ', ' : ''}${addr.postalCode ? addr.postalCode + ', ' : ''}${addr.country || ''}`;
        setUserAddress(direccionTexto);
      }
    })();
  }, []);

  useEffect(() => {
    const repartidorRef = collection(db, 'repartidores');
    const unsubscribe = onSnapshot(repartidorRef, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.lat && data.lng) {
          setRepartidorLocation({
            latitude: data.lat,
            longitude: data.lng,
          });
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const calcularDistanciaYTiempo = () => {
    if (!userLocation || !repartidorLocation) return null;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(repartidorLocation.latitude - userLocation.latitude);
    const dLon = toRad(repartidorLocation.longitude - userLocation.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLocation.latitude)) *
        Math.cos(toRad(repartidorLocation.latitude)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    const tiempoEstimado = Math.round((distancia / 0.3) * 60);

    return `${tiempoEstimado} min aprox.`;
  };

  const renderProducto = (producto, index) => (
    <View key={index} style={styles.productoItem}>
      <Text style={styles.pedidoText}>Producto: {producto.titulo || 'N/A'}</Text>
      <Text style={styles.pedidoText}>Cantidad: {producto.cantidad || 'N/A'}</Text>
      <Text style={styles.pedidoText}>Precio: ${producto.precio || '0.00'}</Text>
    </View>
  );

  const renderPedido = ({ item }) => {
    const fecha = item.fecha ? new Date(item.fecha) : new Date();
    const fechaFormateada = fecha.toLocaleString();

    return (
      <View style={styles.pedidoItem}>
        <Text style={[styles.pedidoText, { fontWeight: 'bold' }]}>Pedido ID: {item.id}</Text>
        <Text style={styles.pedidoText}>Fecha: {fechaFormateada}</Text>
        <Text style={styles.pedidoText}>Estado: {item.estado || 'Pendiente'}</Text>
        <Text style={styles.pedidoText}>Total: ${item.total?.toFixed(2) || '0.00'}</Text>

        <Text style={[styles.pedidoText, { marginTop: 10, fontWeight: 'bold' }]}>Productos:</Text>
        {item.productos && item.productos.length > 0 ? (
          item.productos.map((producto, index) => renderProducto(producto, index))
        ) : (
          <Text style={styles.pedidoText}>No hay productos.</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Título */}
        <Text style={styles.title}>Tus Pedidos</Text>

        {/* Dirección del usuario */}
        {userAddress && (
          <View style={styles.direccionContainer}>
            <Text style={styles.direccionLabel}>Tu ubicación:</Text>
            <Text style={styles.direccionTexto}>{userAddress}</Text>
          </View>
        )}

        {/* Lista de pedidos */}
        {loading && <ActivityIndicator size="large" color="#E499DC" />}
        {!loading && pedidos.length === 0 && (
          <Text style={styles.noPedidos}>No tienes pedidos realizados.</Text>
        )}
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={renderPedido}
          scrollEnabled={false} // Desactivamos scroll en FlatList porque ScrollView controla el scroll
          contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
        />

        {/* Ubicación del repartidor */}
        <Text style={styles.ubicacionTitle}>Ubicación del repartidor</Text>
        {userLocation && repartidorLocation ? (
          <>
            <MapView
              style={styles.map}
              initialRegion={{
                ...userLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={userLocation} title="Tú" pinColor="blue" />
              <Marker coordinate={repartidorLocation} title="Repartidor" pinColor="green" />
            </MapView>
            <Text style={styles.tiempo}>Tiempo estimado: {calcularDistanciaYTiempo()}</Text>
          </>
        ) : (
         <Text style={{ textAlign: 'center', marginTop: 20, color: '#ddd' }}>
  Cargando ubicación...
</Text>
        )}
      </ScrollView>

      {/* Navegación inferior */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          <Ionicons name="home" size={24} color="#E499DC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Favoritos')}>
          <Ionicons name="heart" size={24} color="#E499DC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Pedidos')}>
          <Ionicons name="notifications" size={24} color="#E499DC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Carrito')}>
          <Ionicons name="cart" size={24} color="#E499DC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person" size={24} color="#E499DC" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#E499DC',
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  direccionContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  direccionLabel: {
    fontWeight: 'bold',
    color: '#ddd',
    fontSize: 16,
  },
  direccionTexto: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 2,
  },
  noPedidos: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#666',
    paddingHorizontal: 15,
  },
  pedidoItem: {
    backgroundColor:  'rgba(64, 64, 64, 0.95)',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  pedidoText: {
    fontSize: 16,
    color: '#ddd'
  },
  productoItem: {
    marginLeft: 15,
    marginTop: 5,
  },
  ubicacionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'rgb(228, 153, 220)', 
    marginBottom: 20,
    marginTop: 30,
    paddingHorizontal: 15,
  },
  map: {
    width: '100%',
    height: 250,
    marginTop: 10,
  },
  tiempo: {
    marginTop: 10,
    fontSize: 18,
    color: '#ddd',
    textAlign: 'center',
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: '100%',
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    borderTopColor: '#E499DC',
    borderTopWidth: 1,
  },
});
