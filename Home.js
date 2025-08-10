import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function Home() {
  const navigation = useNavigation();

  const openURL = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error:', err));
  };

  const callNow = () => {
    Linking.openURL('tel:+529999999999'); 
  };

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./imag/image0_large.jpg')}
            style={styles.logo}
          />
          <Text style={styles.title}>𝓒𝓮𝓷𝓽𝓻𝓸 𝓓𝓻𝓲𝓷𝓴𝓼</Text>
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="person-circle-outline" size={24} color="white" />
          <Text style={styles.loginText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <Animatable.Image
        animation="fadeInDown"
        delay={300}
        duration={1000}
        source={{
          uri: 'https://i.pinimg.com/736x/58/3c/d9/583cd92dddc738e8fa5e2e7ffc34e164.jpg',
        }}
        style={styles.banner}
      />

      {/* Sobre Nosotros */}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
        <View style={styles.sectionContent}>
          <Ionicons name="information-circle-outline" size={24} color="#E499DC" />
          <Text style={styles.sectionTitle}>Sobre Nosotros</Text>
          <Text style={styles.sectionText}>
            Somos un bar digital que te conecta con las mejores bebidas locales y artesanales. Disfruta de un ambiente único, rápido y amigable con Centro Drinks.
          </Text>
        </View>
        <Animatable.Image
          animation="zoomIn"
          delay={600}
          source={{
            uri: 'https://i.pinimg.com/1200x/53/5a/8f/535a8fd1666fcfad6285838697d195a3.jpg',
          }}
          style={styles.sectionImage}
        />
      </Animatable.View>

      {/* Ayuda */}
      <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
        <View style={styles.sectionContent}>
          <Ionicons name="help-circle-outline" size={24} color="#E499DC" />
          <Text style={styles.sectionTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.sectionText}>
            ¿Tienes dudas al pedir tus bebidas favoritas? ¡Contáctanos! Nuestro equipo te ayudará a resolver cualquier inconveniente de forma rápida y sencilla.
          </Text>
        </View>
        <Animatable.Image
          animation="zoomIn"
          delay={800}
          source={{
            uri: 'https://i.pinimg.com/1200x/d9/b7/02/d9b70237f2569ba9dd5f386d16d95dab.jpg',
          }}
          style={styles.sectionImage}
        />
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={900} style={styles.socialContainer}>
        <Text style={styles.sectionTitle}>Síguenos o contáctanos</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => openURL('https://www.facebook.com')} style={styles.iconButton}>
            <FontAwesome name="facebook-square" size={32} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openURL('https://www.instagram.com')} style={styles.iconButton}>
            <FontAwesome name="instagram" size={32} color="#C13584" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openURL('https://wa.me/529999999999')} style={styles.iconButton}>
            <FontAwesome name="whatsapp" size={32} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity onPress={callNow} style={styles.iconButton}>
            <Ionicons name="call" size={32} color="#E499DC" />
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Centro Drinks.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: 'rgba(236, 187, 231, 1)',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(10, 95, 180, 1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 6,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 50, 114, 0.97)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(4, 50, 114, 0.97)',
  },
  loginText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
  },
  banner: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  section: {
    backgroundColor: '#111',
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgb(228, 153, 220)',
  },
  sectionImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  sectionContent: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: 'rgb(228, 153, 220)',
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    textAlign: 'justify',
  },
  socialContainer: {
    backgroundColor: '#111',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgb(228, 153, 220)',
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
    width: '100%',
  },
  iconButton: {
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(81, 132, 204, 0.86)',
    backgroundColor: '#000',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
});
