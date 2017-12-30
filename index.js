import { AppRegistry } from 'react-native';
import App from './App';
import { StackNavigator } from 'react-navigation'

import {bootstrap} from './src/config/bootstrap';
import {data} from './src/data'

import Chat from './src/screens/chat'
import AddFriend from './src/screens/addFriend'

bootstrap();
data.populateRealm();

const BPKChat = StackNavigator({
    App: { screen: App },
    Chat: { screen: Chat },
    AddFriend: { screen: AddFriend }
},
{
    initialRouteName: "App",
    headerMode: "none",
})

AppRegistry.registerComponent('BPKChat', () => BPKChat);
