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
import {FontAwesome} from '../../assets/icons';
import { NavigationActions } from 'react-navigation'
import { Thumbnail, Button, Text, Icon, Header, Left, Body, Title, Right } from 'native-base';
import ImagePicker from 'react-native-image-picker'
import {store} from '../../redux'
import { onUpdateProfile } from '../../redux/actions.js'

export default class ProfileSettings extends React.Component {
  static navigationOptions = {
    title: 'Profile Settings'.toUpperCase()
  };

  constructor(props) {
    super(props);
    // this.user = data.getUser();

    this.state = {
        errorMessage: '',
        newPassword: '',
        confirmPassword: ''
    }
  }

  updateData = () => {
      const state = store.getState()
      this.setState({
          display_name: _.get(state, 'user.user.display_name', ''),
          username: _.get(state, 'user.user.username', ''),
          hn: _.get(state, 'user.user.hn', ''),
          status_quote: _.get(state, 'user.user.status_quote', ''),
          wall_pic_url: _.get(state, 'user.user.wall_pic_url', ''),
          profile_pic_url: _.get(state, 'user.user.profile_pic_url', ''),
          user_id: _.get(state, 'user.user.user_id', '')
      })
  }

  async componentWillMount() {
      this.updateData()
      this.unsubscribe = store.subscribe(() => {
          this.updateData()
      })
  }

  componentWillUnmount() {
      this.unsubscribe()
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
                  profile_pic_url: response.uri,
                  profile_pic_base64: response.data || ''
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
                  wall_pic_url: response.uri,
                  wall_pic_base64: response.data || ''
              })
          }
      })
  }

  saveProfile = () => {
      const profile = {
          user_id: this.state.user_id,
          display_name: this.state.display_name,
          status_quote: this.state.status_quote,
          hn: this.state.hn,
          password: this.state.newPassword
      }
      if(this.state.newPassword == this.state.confirmPassword) {
          store.dispatch(onUpdateProfile(
              profile,
              {
                  user_id: this.state.user_id,
                  wall_pic_base64: this.state.wall_pic_base64,
                  profile_pic_base64: this.state.profile_pic_base64
              }
          ))
      } else {
          this.setState({
              errorMessage: 'Password is not matched'
          })
      }

  }

  render() {
    return (
    <View>
    <Header>
        <Left>
            <Button transparent onPress={() => this.props.navigation.dispatch(NavigationActions.back())}>
                <Icon style={{ color: 'white' }} name="md-arrow-round-back" />
            </Button>
        </Left>
        <Body>
            <Title>Profile</Title>
        </Body>
        <Right>
            <Button transparent onPress={() => this.saveProfile() }>
                <Icon style={{ color: 'white' }} name="md-checkmark" />
            </Button>
        </Right>
    </Header>
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
             <View>
                 {
                     !!this.state.errorMessage&&<Text style={{ textAlign: 'center', color: 'red', marginTop: 10 }}>{ this.state.errorMessage }</Text>
                 }
             </View>
           </View>

        </RkAvoidKeyboard>

      </ScrollView>
     </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base,
    marginBottom: 40
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
