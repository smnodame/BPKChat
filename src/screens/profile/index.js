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
import ImagePicker from 'react-native-image-picker'
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

  selectProfileImage = () => {
      ImagePicker.showImagePicker({
          title: 'Select Profile Image',
          storageOptions: {
            skipBackup: true,
            path: 'images'
        },
        mediaType: 'photo',
        noData: false
      }, (response) => {
          console.log('Response = ', response);

          if (response.didCancel) {
              console.log('User cancelled image picker')
          }
          else if (response.error) {
              console.log('ImagePicker Error: ', response.error)
          }
          else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton)
          }
          else {
              this.setState({
                  profile_pic_url: response.uri
              })
          }
      })
  }

  selectWallImage = () => {
      ImagePicker.showImagePicker({
          title: 'Select Wall Image',
          storageOptions: {
            skipBackup: true,
            path: 'images'
        },
        mediaType: 'photo',
        noData: false
      }, (response) => {
          console.log('Response = ', response);

          if (response.didCancel) {
              console.log('User cancelled image picker')
          }
          else if (response.error) {
              console.log('ImagePicker Error: ', response.error)
          }
          else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton)
          }
          else {
              this.setState({
                  wall_pic_url: response.uri
              })
          }
      })
  }

  render() {
    return (
      <ScrollView style={styles.root}>
        <RkAvoidKeyboard>
        <View style={{ height: 220 , backgroundColor: '#fafafa'}}>
            <Image
                resizeMethod={'resize'}
                style={{width: '100%', height: 150, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                source={{uri: this.state.wall_pic_url}}
            />
            <Button
                transparent
                dark
                onPress={() => {
                    this.selectWallImage()
                }}
                style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                }}
            >
                <Text>UPDATE WALL PHOTO</Text>
            </Button>
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
                 onPress={() => {
                     this.selectProfileImage()
                 }}
             >
                <View>
                    <Image
                        resizeMethod={'resize'}
                        style={{
                            width: 110,
                            height: 110,
                            borderRadius: 55
                        }}
                        source={{uri: this.state.profile_pic_url}}
                    />
                    <Button
                        block
                        transparent
                        dark
                        style={{
                            position: 'absolute',
                            width: 100,
                            height: 30,
                            marginLeft: -50,
                            bottom: 0,
                            left: '50%',
                            zIndex: 999,
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        }}>
                        <Text>EDIT</Text>
                    </Button>
                </View>
            </TouchableHighlight>
        </View>
        <View>
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
