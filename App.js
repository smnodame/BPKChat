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
  TouchableOpacity
} from 'react-native';
import {signIn} from './src/redux/actions.js'
import {store} from './src/redux'

import ProfileSettings from './src/screens/history'
import ChatList from './src/screens/contact'
import Contacts from './src/screens/profile'
import Chat from './src/screens/chat'

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

    onTabClick(selectedTab) {
        this.setState({
            selectedTab
        })
        store.dispatch(signIn('testuser', 'secret'))
        store.subscribe((state) => {
            console.log(store.getState())
        })
    }

    renderContent() {
        if(this.state.selectedTab == 'Friends') {
            return (
                <Contacts />
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
                      <Button transparent>
                          <Icon name="md-person-add" />
                      </Button>
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
        );
    }
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
});
