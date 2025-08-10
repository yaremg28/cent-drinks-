import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    obtenerCarrito();
  }, []);

  const obtenerCarrito = async () => {
    try {
      if (!auth.currentUser) return;

      const q = query(collection(db, 'carrito'), where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const productos = [];
      let sumaTotal = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productos.push({ id: doc.id, ...data });
        const cantidad = data.cantidad ? data.cantidad : 1;
        sumaTotal += parseFloat(data.precio) * cantidad;
      });

      setCarrito(productos);
      setTotal(sumaTotal);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'carrito', id));
      obtenerCarrito(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return; // No permitir cantidades menores a 1
    try {
      const docRef = doc(db, 'carrito', id);
      await updateDoc(docRef, { cantidad: nuevaCantidad });
      obtenerCarrito();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  const finalizarCompra = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para finalizar la compra.');
      return;
    }

    try {
      // Obtener datos del usuario (ejemplo: dirección)
      const usuarioRef = doc(db, 'registro', auth.currentUser.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        Alert.alert('Error', 'No se encontró la información del usuario.');
        return;
      }

      const usuarioData = usuarioSnap.data();
      const direccion = usuarioData.direccion || 'Sin dirección';

      // Fecha y hora actual
      const fecha = new Date();

      // Crear el objeto pedido con los datos
      const pedido = {
        uid: auth.currentUser.uid,
        fecha: fecha.toISOString(),
        total: total,
        direccion: direccion,
        productos: carrito.map(item => ({
          id: item.id,
          titulo: item.titulo,
          precio: item.precio,
          cantidad: item.cantidad || 1,
        })),
        estado: 'Pendiente',
      };

      // Guardar pedido en Firestore
      await addDoc(collection(db, 'pedidos'), pedido);

      // Limpiar carrito
      for (const item of carrito) {
        await deleteDoc(doc(db, 'carrito', item.id));
      }

      // Refrescar carrito (vaciar)
      setCarrito([]);
      setTotal(0);

      Alert.alert('Compra realizada', 'Gracias por tu compra');
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      Alert.alert('Error', 'No se pudo completar la compra.');
    }
  };

  const renderItem = ({ item }) => {
    const cantidad = item.cantidad ? item.cantidad : 1;

    return (
      <View style={styles.item}>
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
        <View style={styles.itemText}>
          <Text style={styles.nombre}>{item.titulo}</Text>
          <Text style={styles.precio}>${item.precio}</Text>
        </View>

        <View style={styles.cantidadContainer}>
          <TouchableOpacity
            style={styles.cantidadBoton}
            onPress={() => actualizarCantidad(item.id, cantidad - 1)}
          >
            <Text style={styles.cantidadBotonTexto}>-</Text>
          </TouchableOpacity>

          <Text style={styles.cantidadTexto}>{cantidad}</Text>

          <TouchableOpacity
            style={styles.cantidadBoton}
            onPress={() => actualizarCantidad(item.id, cantidad + 1)}
          >
            <Text style={styles.cantidadBotonTexto}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => eliminarProducto(item.id)} style={{ marginLeft: 10 }}>
          <Ionicons name="trash" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi Carrito</Text>

      <FlatList
        data={carrito}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vacio}>Tu carrito está vacío.</Text>}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalTexto}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={finalizarCompra}
        >
          <Text style={styles.botonTexto}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.salir} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={40} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          <Ionicons name="home" size={24} color="#E499DC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Favoritos')}>
          <Ionicons name="heart" size={24} color="#E499DC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notificacion')}>
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
    padding: 20,
    paddingBottom: 85,
    backgroundColor: '#000',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'rgb(228, 153, 220)',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    borderWidth: 1.5,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  itemText: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  precio: {
    fontSize: 16,
    color: '#aaa',
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadBoton: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  cantidadBotonTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cantidadTexto: {
    color: '#fff',
    fontSize: 18,
    marginHorizontal: 10,
    minWidth: 25,
    textAlign: 'center',
  },
  totalContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#444',
    paddingTop: 20,
  },
  totalTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  boton: {
    backgroundColor: 'rgba(4, 50, 114, 0.97)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  salir: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  vacio: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 50,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: '112%',
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
