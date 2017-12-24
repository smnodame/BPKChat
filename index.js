import { AppRegistry } from 'react-native';
import App from './App';

import {bootstrap} from './src/config/bootstrap';
import {data} from './src/data'

bootstrap();
data.populateRealm();

import ChatList from './src/screens/contact'

AppRegistry.registerComponent('BPKChat', () => ChatList);
