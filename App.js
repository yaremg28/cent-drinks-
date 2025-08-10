import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './Home';
import Login from './Login';
import Registro from './Registro';
import Recuperar from './Recuperar';
import Menu from './Menu';
import Perfil from './Perfil';
import Carrito from './Carrito';
import Favoritos from './Favoritos';
import Ubi from './Ubi';
import Notificacion from './Notificacion';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name= "Login" component={Login}/>
            <Stack.Screen name="Registro"  component={Registro} />
            <Stack.Screen name="Recuperar" component={Recuperar}/>
            <Stack.Screen name="Menu" component={Menu}/>
            <Stack.Screen name='Perfil' component={Perfil}/>
            <Stack.Screen name='Carrito' component={Carrito}/>
            <Stack.Screen name ='Notificacion' component={Notificacion}/>
            <Stack.Screen name='Favoritos' component={Favoritos}/>
            <Stack.Screen name="Ubi" component={Ubi}/>
            

          </Stack.Navigator>
        </NavigationContainer>
  );
}