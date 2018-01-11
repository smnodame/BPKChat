import _ from 'lodash'
import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableHighlight
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
import { Thumbnail, Button, Text, Icon } from 'native-base';

import {store} from '../../redux'


export default class ProfileSettings extends React.Component {
  static navigationOptions = {
    title: 'Profile Settings'.toUpperCase()
  };

  constructor(props) {
    super(props);
    // this.user = data.getUser();

    this.state = {
    }
  }

  updateData = () => {
      const state = store.getState()
      this.setState({
          display_name: _.get(state, 'user.user.display_name', ''),
          username: _.get(state, 'user.user.username', ''),
          hn: _.get(state, 'user.user.status_quote', ''),
          status_quote: _.get(state, 'user.user.status_quote', ''),
          wall_pic_url: _.get(state, 'user.user.wall_pic_url', ''),
          profile_pic_url: _.get(state, 'user.user.profile_pic_url', '')
      })
  }

  async componentWillMount() {
      this.updateData()
      store.subscribe(() => {
          this.updateData()
      })
  }

  render() {
    return (
      <ScrollView style={styles.root}>
        <RkAvoidKeyboard>
        <View style={{ height: 220 , backgroundColor: '#fafafa'}}>
            <Image
                style={{width: '100%', height: 150, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                source={{uri: this.state.wall_pic_url}}
            />
            <TouchableHighlight
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
             onPress={() => alert('hello')}>
                <Image
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: 55
                    }}
                    source={{uri: this.state.profile_pic_url}}

                />
            </TouchableHighlight>
        </View>
        <View>
            <Button block bordered>
                <Text>Info</Text>
            </Button>
        </View>
          <View style={styles.section}>
            <View style={[styles.row, styles.heading]}>
              <RkText rkType='header6 primary'>INFO</RkText>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Display Name'
                           value={this.state.display_name}
                           rkType='right clear'
                           onChangeText={(text) => this.setState({display_name: text})}/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Username'
                           value={this.state.username}
                           onChangeText={(text) => this.setState({username: text})}
                           rkType='right clear'/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='Status'
                           value={this.state.status_quote}
                           onChangeText={(text) => this.setState({status_quote: text})}
                           rkType='right clear'/>
            </View>
            <View style={styles.row}>
              <RkTextInput label='HN'
                           value={this.state.hn}
                           onChangeText={(text) => this.setState({hn: text})}
                           rkType='right clear'/>
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


//   <View style={styles.section}>
//     <View style={[styles.row, styles.heading]}>
//       <RkText rkType='primary header6'>CHANGE PASSWORD</RkText>
//     </View>
//     <View style={styles.row}>
//       <RkTextInput label='Old Password'
//                    value={this.state.password}
//                    rkType='right clear'
//                    secureTextEntry={true}
//                    onChangeText={(text) => this.setState({password: text})}/>
//     </View>
//     <View style={styles.row}>
//       <RkTextInput label='New Password'
//                    value={this.state.newPassword}
//                    rkType='right clear'
//                    secureTextEntry={true}
//                    onChangeText={(text) => this.setState({newPassword: text})}/>
//     </View>
//     <View style={styles.row}>
//       <RkTextInput label='Confirm Password'
//                    value={this.state.confirmPassword}
//                    rkType='right clear'
//                    secureTextEntry={true}
//                    onChangeText={(text) => this.setState({confirmPassword: text})}/>
//     </View>
//   </View>
