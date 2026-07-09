/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundNotificationHandlers } from './src/services/notifications';

registerBackgroundNotificationHandlers();

AppRegistry.registerComponent(appName, () => App);
