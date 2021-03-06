/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Container,
    Header,
    Content,
    Footer,
    FooterTab,
    Button,
    Icon,
    Text,
    List,
    ListItem,
    Left,
    Body,
    Right,
    Thumbnail,
    Title,
    Badge
} from 'native-base';
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  Keyboard
} from 'react-native'
import { signIn, logout, navigate } from './src/redux/actions.js'
import Drawer from 'react-native-drawer'

import ProfileSettings from './src/screens/profile'
import ChatList from './src/screens/chatlist'
import Contacts from './src/screens/contact'
import Chat from './src/screens/chat'
import GridMenu from './src/screens/gridMenu'

const deviceHeight = Dimensions.get("window").height
const deviceWidth = Dimensions.get("window").width

import { enterContacts } from './src/redux/actions.js'
import { store } from './src/redux'
import { saveNotiToken } from './src/redux/api.js'

import RNFetchBlob from 'react-native-fetch-blob'

import {NotificationsAndroid} from 'react-native-notifications';

// On Android, we allow for only one (global) listener per each event type.
NotificationsAndroid.setRegistrationTokenUpdateListener((deviceToken) => {
	// TODO: Send the token to my server so it could send back push notifications...
	console.log('Push-notifications registered!', deviceToken)
    saveNotiToken(deviceToken).then((res) => {
        console.log('Finished Save Token to Server')
        console.log(res)
    })
});

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {

    constructor(props) {
        super(props)
        this.state = {
          selectedTab: 'Friends',
          showFooter: true
        }
        this.onTabClick = this.onTabClick.bind(this)
        this.renderContent = this.renderContent.bind(this)

        // store.dispatch(navigate(this.props.navigation))
    }

    async componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this))
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this))
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove()
        this.keyboardDidHideListener.remove()
    }

    _keyboardDidShow () {
        this.setState({showFooter: false})
    }

    _keyboardDidHide () {
        this.setState({showFooter: true})
    }

    openControlPanel = () => {
		this._drawer.open()
	}

    onTabClick(selectedTab) {
        this.setState({
            selectedTab
        })
    }

    renderContent() {
        if(this.state.selectedTab == 'Friends') {
            return (
                <Contacts screenProps={{ rootNavigation: this.props.navigation }} onTabClick={this.onTabClick} />
            )
        } else if (this.state.selectedTab == 'Chats') {
            return (
                <ChatList screenProps={{ rootNavigation: this.props.navigation }} />
            )
        } else if (this.state.selectedTab == 'Setting') {
            return (
                <GridMenu screenProps={{ rootNavigation: this.props.navigation }} />
            )
        }
    }

    render() {
        return (
            <Drawer
    	        ref={(ref) => this._drawer = ref}
    	        type="overlay"
    	        tapToClose={true}
    	        openDrawerOffset={0.2} // 20% gap on the right side of drawer
    	        panCloseMask={0.2}
    	        closedDrawerOffset={-3}
    	        styles={drawerStyles}
    	        tweenHandler={(ratio) => ({
    	            main: { opacity:(2-ratio)/2}
    	        })}
    	        content=
    	        {
    	            <Container>
    					<Content bounces={false} style={{ flex: 1, backgroundColor: "#fff", top: -1 }}>
    						<View  style={styles.drawerCover}>
    							<Image square style={styles.drawerImage} source={  require('./src/assets/logo.png') } />
    						</View>
    						<List>
    							<ListItem itemHeader first style={{ paddingBottom: 3 }}>
    								<Text>ACCOUNT</Text>
    							</ListItem>
    							<ListItem button noBorder onPress={() => store.dispatch(logout())}>
    								<Left>
    									<Icon active name='log-out' style={{ color: "#777", fontSize: 26, width: 30 }} />
    									<Text style={styles.text}>
    										Log Out
    									</Text>
    								</Left>
    							</ListItem>
    						</ List>
    					</Content>
    				</Container>
    	        }
	    >
            <Container>
              <Header style={{ backgroundColor: '#3b5998' }}>
                  <Left>
                      <Button transparent onPress={() => this.openControlPanel()}>
                          <Icon style={{ color: 'white' }} name="md-menu" />
                      </Button>
                  </Left>
                  <Body>
                      <Title>{ this.state.selectedTab }</Title>
                  </Body>
                  <Right>
                  </Right>
              </Header>
              <Content style={{ backgroundColor: 'white' }}>
              {
                  this.renderContent()
              }
              </Content>
              {
                  this.state.showFooter && <Footer style={{ backgroundColor: '#3b5998' }}>
                    <FooterTab style={{ backgroundColor: '#3b5998' }}>
                      <Button vertical onPress={() => this.onTabClick('Friends')}>
                        <Icon style={{ color: 'white' }} name="md-contacts" />
                        <Text style={{ color: 'white' }}>Contacts</Text>
                      </Button>
                      <Button vertical onPress={() => this.onTabClick('Chats')}>
                        <Icon style={{ color: 'white' }} name="md-chatboxes" />
                        <Text style={{ color: 'white' }}>Chat Lists</Text>
                      </Button>
                      <Button vertical onPress={() => this.onTabClick('Setting')}>
                        <Icon style={{ color: 'white' }} active name="md-settings" />
                        <Text style={{ color: 'white' }}>SETTINGS</Text>
                      </Button>
                    </FooterTab>
                  </Footer>
              }
            </Container>
        </Drawer>
        );
    }
}

const drawerStyles = {
     drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
     main: {paddingLeft: 3},
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  drawerCover: {
		alignSelf: "stretch",
		// resizeMode: 'cover',
		height: deviceHeight / 3.5,
		width: null,
		position: "relative",
		marginBottom: 10,
		backgroundColor: '#004B85'
	},
	drawerImage: {
		position: "absolute",
		// left: (Platform.OS === 'android') ? 30 : 40,
		left: Platform.OS === "android" ? deviceWidth / 15 : deviceWidth / 12,
		// top: (Platform.OS === 'android') ? 45 : 55,
		top: Platform.OS === "android" ? deviceHeight / 13 : deviceHeight / 12,
		width: 250,
		height: 75,
		resizeMode: "cover"
	}
});
