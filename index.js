import { AppRegistry } from 'react-native';
import App from './App';
import { StackNavigator } from 'react-navigation'

import {bootstrap} from './src/config/bootstrap';

import Chat from './src/screens/chat'
import AddFriend from './src/screens/addFriend'
import Login from './src/screens/login'
import SignUp from './src/screens/register'
import GroupSetting from './src/screens/groupSetting'
import ProfileSettings from './src/screens/profile'
import Splash from './src/screens/splash'
import RecieveMessage from './src/screens/recieveMessage'
import Calling from './src/screens/calling'

import {store} from './src/redux'
import { start_app  } from './src/redux/actions.js'

// start material UI
bootstrap()

// call first action that should do
store.dispatch(start_app())

const BPKChat = StackNavigator({
    App: { screen: App },
    Chat: { screen: Chat },
    AddFriend: { screen: AddFriend },
    Login: { screen: Login },
    SignUp: { screen: SignUp },
    GroupSetting: { screen: GroupSetting },
    ProfileSettings: { screen: ProfileSettings },
    Splash: { screen: Splash },
    RecieveMessage: { screen: RecieveMessage },
    Calling: { screen: Calling }
},
{
    initialRouteName: "Splash",
    headerMode: "none",
})

AppRegistry.registerComponent('BPKChat', () => BPKChat);
