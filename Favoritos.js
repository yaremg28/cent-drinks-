
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, 'favoritos'), where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavoritos(items);
    };

    cargarFavoritos();
  }, []);

  const eliminarFavorito = async (id) => {
    await deleteDoc(doc(db, 'favoritos', id));
    setFavoritos(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagen }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.price}>${item.precio}</Text>
      </View>
      <TouchableOpacity onPress={() => eliminarFavorito(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Favoritos</Text>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No tienes productos favoritos.</Text>}
      />

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
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  header: { fontSize: 24, color: '#E499DC', marginBottom: 15, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  info: { flex: 1 },
  title: { fontSize: 16, color: '#fff' },
  price: { color: '#E499DC', fontSize: 14 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 50 },

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

