/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async () => {
  // Les notifications en arrière-plan sont gérées par le système Android
});

AppRegistry.registerComponent(appName, () => App);
