import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Image
} from 'react-native';
import {
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkTheme,
  RkStyleSheet
} from 'react-native-ui-kitten';
import {data} from '../../data';
import {FontAwesome} from '../../assets/icons';
import { Thumbnail, Button, Text } from 'native-base';

export default class ProfileSettings extends React.Component {
  static navigationOptions = {
    title: 'Profile Settings'.toUpperCase()
  };

  constructor(props) {
    super(props);
    this.user = data.getUser();

    this.state = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      country: this.user.country,
      phone: this.user.phone,
      password: this.user.password,
      newPassword: this.user.newPassword,
      confirmPassword: this.user.confirmPassword,
      twitter: true,
      google: false,
      facebook: false
    }
  }

  render() {
    return (
      <ScrollView style={styles.root}>
        <RkAvoidKeyboard>
        <View style={{ height: 220 , backgroundColor: '#fafafa'}}>
            <Image
                style={{width: '100%', height: 150, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                source={{uri: 'https://images.alphacoders.com/685/685151.jpg'}}
            />
            <Image
                style={{
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    borderColor: 'white',
                    borderWidth: 1,
                    position: 'absolute',
                    top: 95,
                    left: '50%',
                    marginLeft: -55
                }}
                source={{uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg'}}
            />
        </View>
        <View>
            <Button transparent info>
                <Text>Change Profile Image</Text>
            </Button>
            <Button transparent>
                <Text>Change Wallpaper Image</Text>
            </Button>
        </View>
          <View style={styles.section}>
            <View style={[styles.row, styles.heading]}>
              <RkText rkType='header6 primary'>INFO</RkText>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Display Name'
                           value={'Boonprakit'}
                           rkType='right clear'
                           onChangeText={(text) => this.setState({firstName: text})}/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Username'
                           value={'Smnodame'}
                           onChangeText={(text) => this.setState({lastName: text})}
                           rkType='right clear'/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Status'
                           value={' Feel bad at this time '}
                           onChangeText={(text) => this.setState({email: text})}
                           rkType='right clear'/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='HN'
                           value={'1-4848-488'}
                           onChangeText={(text) => this.setState({country: text})}
                           rkType='right clear'/>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.row, styles.heading]}>
              <RkText rkType='primary header6'>CHANGE PASSWORD</RkText>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Old Password'
                           value={this.state.password}
                           rkType='right clear'
                           secureTextEntry={true}
                           onChangeText={(text) => this.setState({password: text})}/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='New Password'
                           value={this.state.newPassword}
                           rkType='right clear'
                           secureTextEntry={true}
                           onChangeText={(text) => this.setState({newPassword: text})}/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Confirm Password'
                           value={this.state.confirmPassword}
                           rkType='right clear'
                           secureTextEntry={true}
                           onChangeText={(text) => this.setState({confirmPassword: text})}/>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.row, styles.heading]}>
              <RkText rkType='primary header6'>CONNECT YOUR ACCOUNT</RkText>
            </View>
          </View>
        </RkAvoidKeyboard>
      </ScrollView>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base
  },
  header: {
    backgroundColor: theme.colors.screen.neutral,
    paddingVertical: 25
  },
  section: {
    marginVertical: 25
  },
  heading: {
    paddingBottom: 12.5
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 17.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base,
    alignItems: 'center'
  },
  button: {
    marginHorizontal: 16,
    marginBottom: 32
  }
}));
