import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { UnitProvider } from './src/context/UnitContext';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      <UnitProvider>
        <StatusBar style="light" />
        {!splashDone && (
          <SplashScreen onFinish={() => setSplashDone(true)} />
        )}
        {splashDone && (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        )}
      </UnitProvider>
    </SafeAreaProvider>
  );
}
