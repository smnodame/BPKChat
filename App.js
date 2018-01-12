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
  Image
} from 'react-native';
import {signIn} from './src/redux/actions.js'
import Drawer from 'react-native-drawer'

import ProfileSettings from './src/screens/profile'
import ChatList from './src/screens/chatlist'
import Contacts from './src/screens/contact'
import Chat from './src/screens/chat'

const deviceHeight = Dimensions.get("window").height
const deviceWidth = Dimensions.get("window").width

import { enterContacts } from './src/redux/actions.js'
import { store } from './src/redux'

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
          selectedTab: 'Friends'
        }
        this.onTabClick = this.onTabClick.bind(this)
        this.renderContent = this.renderContent.bind(this)
    }

    onLoginClick() {


    }

    async componentWillMount() {
        store.dispatch(enterContacts())

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
                <Contacts onTabClick={this.onTabClick} />
            )
        } else if (this.state.selectedTab == 'Chats') {
            return (
                <ChatList screenProps={{ rootNavigation: this.props.navigation }} />
            )
        } else if (this.state.selectedTab == 'Profile') {
            return (
                <ProfileSettings />
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
    							<ListItem button noBorder onPress={() => this._drawer.close()}>
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
                          <Icon name="md-menu" />
                      </Button>
                  </Left>
                  <Body>
                      <Title>{ this.state.selectedTab }</Title>
                  </Body>
                  <Right>
                  </Right>
              </Header>
              <Content>
              {
                  this.renderContent()
              }
              </Content>
              <Footer style={{ backgroundColor: '#3b5998' }}>
                <FooterTab style={{ backgroundColor: '#3b5998' }}>
                  <Button vertical onPress={() => this.onTabClick('Friends')}>
                    <Icon name="md-contacts" />
                    <Text>Contacts</Text>
                  </Button>
                  <Button badge vertical onPress={() => this.onTabClick('Chats')}>
                    <Badge ><Text>51</Text></Badge>
                    <Icon name="md-chatboxes" />
                    <Text>Chat Lists</Text>
                  </Button>
                  <Button vertical onPress={() => this.onTabClick('Profile')}>
                    <Icon active name="md-settings" />
                    <Text>SETTINGS</Text>
                  </Button>
                </FooterTab>
              </Footer>
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
