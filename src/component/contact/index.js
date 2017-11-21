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
    Thumbnail
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

export default class Contact extends Component<{}> {

    constructor(props) {
        super(props)
    }

    render() {
        return (
          <Content style={{ backgroundColor: '#FFF'}}>
            <List>
                <ListItem itemDivider>
                  <Text>Profile</Text>
                </ListItem>
                <ListItem>
                  <Thumbnail size={20} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
                </ListItem>
                <ListItem itemDivider>
                  <Text>Groups</Text>
                </ListItem>
                <ListItem>
                  <Thumbnail size={80} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
                </ListItem>
                <ListItem>
                  <Thumbnail size={80} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
                </ListItem>
                <ListItem itemDivider>
                  <Text>Friends</Text>
                </ListItem>
                <ListItem>
                  <Thumbnail size={80} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
                </ListItem>
                <ListItem>
                  <Thumbnail size={80} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
                </ListItem>
                <ListItem>
                  <Thumbnail size={80} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
                </ListItem>
                <ListItem>
                  <Thumbnail size={80} source={{ uri: 'http://www.billboard.com/files/media/Taylor-Swift-oct-22-2016-billboard-1548.jpg' }} />
                  <Body>
                    <Text>Sankhadeep</Text>
                  </Body>
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
