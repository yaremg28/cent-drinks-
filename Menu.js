import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { auth } from './firebase';

const db = getFirestore();

const categories = ['All', 'Snaks', 'Pollo', 'Banderilla', 'Bebidas'];

const products = [
  {
    id: '1',
    title: 'Alitas',
    category: 'Pollo',
    price: 120,
    image: { uri: 'https://i.pinimg.com/1200x/ec/cb/9c/eccb9c8e913452d6179022f3173e3fe4.jpg' },
  },
  {
    id: '2',
    title: 'Nachos',
    category: 'Snaks',
    price: 50,
    image: { uri: 'https://i.pinimg.com/736x/0f/d3/40/0fd34039434012970c7170071c237781.jpg' },
  },
  {
    id: '3',
    title: 'Azulito',
    category: 'Bebidas',
    price: 70,
    image: { uri: 'https://i.pinimg.com/1200x/2c/30/48/2c3048b418078d5a6ca41392acd0d8f6.jpg' },
  },
  {
    id: '4',
    title: 'Banderilla Papas',
    category: 'Banderilla',
    price: 55,
    image: { uri: 'https://i.pinimg.com/736x/46/9b/1a/469b1a760bdc1adb24e9b73dfdeb20b7.jpg' },
  },
];

export default function Menu() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState(''); 
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'registro', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.log('Error al obtener perfil:', error);
          setProfile(null);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleAddToFavorites = async (item) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, 'favoritos'), {
          productoId: item.id,
          titulo: item.title,
          categoria: item.category,
          precio: item.price,
          imagen: item.image.uri,
          uid: user.uid,
          email: user.email,
          fecha: new Date(),
        });
        console.log('Agregado a favoritos');
      } catch (error) {
        console.error('Error al agregar a favoritos:', error);
      }
    }
  };

  const handleAddToCart = async (item) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, 'carrito'), {
          productoId: item.id,
          titulo: item.title,
          categoria: item.category,
          precio: item.price,
          imagen: item.image.uri,
          uid: user.uid,
          email: user.email,
          cantidad: 1,
          fecha: new Date(),
        });
        console.log('Agregado al carrito');
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      }
    }
  };

  // Filtrado con búsqueda y categoría
  const filteredProducts = products.filter((item) => {
    // Filtrar por categoría (o mostrar todos)
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;

    // Filtrar por texto de búsqueda (busca en título y categoría, sin importar mayúsculas/minúsculas)
    const searchMatch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        {profile && profile.fotoURL ? (
          <Image source={{ uri: profile.fotoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <MaterialIcons name="person" size={30} color="#E499DC" />
          </View>
        )}

        <View style={styles.headerText}>
          <Text style={styles.offerText}>𝓒𝓮𝓷𝓽𝓻𝓸 𝓓𝓻𝓲𝓷𝓀𝓼</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Ubi')}>
          <Ionicons name="location" size={22} color="#E499DC" />
        </TouchableOpacity>

      </Animatable.View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#E499DC" style={{ marginRight: 5 }} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            style={{ color: '#fff', flex: 1 }}
            value={searchText}
            onChangeText={(text) => setSearchText(text)} 
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color="#E499DC" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, selectedCategory === cat && styles.selectedCategory]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product list */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>

            <View style={styles.actionIcons}>
              <TouchableOpacity onPress={() => handleAddToFavorites(item)} style={styles.iconButton}>
                <Ionicons name="heart-outline" size={20} color="#E499DC" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleAddToCart(item)} style={styles.iconButton}>
                <Ionicons name="cart-outline" size={20} color="#E499DC" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

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
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderAvatar: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  offerText: {
    color: '#E499DC',
    fontSize: 25,
    fontWeight: 'bold',
  },
  offerSubText: {
    color: '#E499DC',
    fontSize: 14,
  },
  locationText: {
    fontSize: 12,
    color: '#E499DC',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    borderWidth: 2,
  },
  filterBtn: {
    backgroundColor: '#111',
    marginLeft: 10,
    padding: 10,
    borderRadius: 10,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    borderWidth: 2,
  },
  categories: {
    flexDirection: 'row',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#111',
    borderRadius: 20,
    marginHorizontal: 5,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    borderWidth: 2,
  },
  selectedCategory: {
    backgroundColor: '#E499DC',
  },
  categoryText: {
    color: '#fff',
  },
  selectedText: {
    color: '#000',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(64, 64, 64, 0.95)',
    borderRadius: 30,
    margin: 10,
    flex: 0.5,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 35,
    marginBottom: 10,
  },
  productTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  productCategory: {
    fontSize: 12,
    color: '#aaa',
  },
  productPrice: {
    marginTop: 5,
    color: '#E499DC',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '60%',
  },
  iconButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#222',
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
