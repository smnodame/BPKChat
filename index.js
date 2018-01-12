import { AppRegistry } from 'react-native';
import App from './App';
import { StackNavigator } from 'react-navigation'

import {bootstrap} from './src/config/bootstrap';
import {data} from './src/data'

import Chat from './src/screens/chat'
import AddFriend from './src/screens/addFriend'
import Login from './src/screens/login'
import SignUp from './src/screens/register'
import GroupSetting from './src/screens/groupSetting'
import {store} from './src/redux'
import { start_app  } from './src/redux/actions.js'

bootstrap();
data.populateRealm();
store.dispatch(start_app())

const BPKChat = StackNavigator({
    App: { screen: App },
    Chat: { screen: Chat },
    AddFriend: { screen: AddFriend },
    Login: { screen: Login },
    SignUp: { screen: SignUp },
    GroupSetting: { screen: GroupSetting }
},
{
    initialRouteName: "App",
    headerMode: "none",
})

AppRegistry.registerComponent('BPKChat', () => BPKChat);
