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
    Title
} from 'native-base';
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import {signIn} from './src/redux/actions.js'
import {store} from './src/redux'

import History from './src/component/history'
import Contact from './src/component/contact'
import Profile from './src/component/profile'

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
        store.dispatch(signIn('testuser', 'secret'))
        store.subscribe(() => {
        })
    }

    onTabClick(selectedTab) {
        this.setState({
            selectedTab
        })
    }

    renderContent() {
        if(this.state.selectedTab == 'Friends') {
            return (
                <Contact />
            )
        } else if (this.state.selectedTab == 'Chats') {
            return (
                <History />
            )
        } else if (this.state.selectedTab == 'Profile') {
            return (
                <Profile />
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
              </Header>
              {
                  this.renderContent()
              }
              <Footer style={{ backgroundColor: '#3b5998' }}>
                <FooterTab style={{ backgroundColor: '#3b5998' }}>
                  <Button vertical onPress={() => this.onTabClick('Friends')}>
                    <Icon name="apps" />
                    <Text>Apps</Text>
                  </Button>
                  <Button vertical onPress={() => this.onTabClick('Chats')}>
                    <Icon name="camera" />
                    <Text>Camera</Text>
                  </Button>
                  <Button vertical onPress={() => this.onTabClick('Profile')}>
                    <Icon active name="navigate" />
                    <Text>Navigate</Text>
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
