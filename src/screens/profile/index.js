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
    Switch
} from 'native-base';
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class Profile extends Component<{}> {

    constructor(props) {
        super(props)
    }

    render() {
        return (
          <Content style={{ backgroundColor: '#FFF'}}>
              <List>
              <ListItem icon>
                <Body>
                  <Text>Airplane Mode</Text>
                </Body>
                <Right>
                  <Switch value={false} />
                </Right>
              </ListItem>
              <ListItem icon>
                <Body>
                  <Text>Display Name</Text>
                </Body>
                <Right>
                  <Text>Smnodame</Text>
                </Right>
              </ListItem>
              <ListItem itemDivider>
                <Text>Status Message</Text>
              </ListItem>
              <ListItem icon>
                <Body>
                  <Text>Bluetooth</Text>
                </Body>
                <Right>
                  <Text>On</Text>
                </Right>
              </ListItem>
              <ListItem itemDivider>
              </ListItem>
              <ListItem icon>
                <Body>
                  <Text>User ID</Text>
                </Body>
                <Right>
                  <Text>Boonprakit</Text>
                </Right>
              </ListItem>
              <ListItem icon>
                <Body>
                  <Text>Password</Text>
                </Body>
                <Right>
                  <Text>secret</Text>
                </Right>
              </ListItem>
            </List>
          </Content>
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
