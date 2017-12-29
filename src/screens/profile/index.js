import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput
} from 'react-native-ui-kitten';
import Modal from 'react-native-modal';
import { Thumbnail, Icon, Text, Button } from 'native-base';
import {data} from '../../data';
import {Avatar} from '../../components/avatar';
import {FontAwesome} from '../../assets/icons';

export default class Contacts extends React.Component {
  static navigationOptions = {
    title: 'Contacts'.toUpperCase()
  };

  constructor(props) {
    super(props);

    this.users = data.getUsers();

    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data: ds.cloneWithRows(this.users),
      showProfileModal: false,
      showFriendModal: false
    };

    this.filter = this._filter.bind(this);
    this.setData = this._setData.bind(this);
    this.renderHeader = this._renderHeader.bind(this);
    this.renderRow = this._renderRow.bind(this);
  }

  _setData(data) {
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.setState({
      data: ds.cloneWithRows(data)
    })
  }

  _renderRow(row) {
    let name = `${row.firstName} ${row.lastName}`;
    return (
      <TouchableOpacity onPress={() => this.setState({ showFriendModal: true })}>
        <View style={styles.container}>
            <Thumbnail  style={styles.avatar}  source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg'}} />
            <RkText rkType='header5'>{name}</RkText>
        </View>
      </TouchableOpacity>
    )
  }

  renderSeparator(sectionID, rowID) {
    return (
      <View style={styles.separator}/>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.searchContainer}>
        <RkTextInput autoCapitalize='none'
                     autoCorrect={false}
                     onChange={(event) => this._filter(event.nativeEvent.text)}
                     label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                     rkType='row'
                     placeholder='Search'/>
      </View>
    )
  }

  _filter(text) {
    let pattern = new RegExp(text, 'i');
    let users = _.filter(this.users, (user) => {

      if (user.firstName.search(pattern) != -1
        || user.lastName.search(pattern) != -1)
        return user;
    });

    this.setData(users);
  }

  render() {
    return (
        <View>
            <Modal
                onRequestClose={() => this.setState({ showProfileModal: false })}
                onBackdropPress={() => this.setState({ showProfileModal: false })}
                isVisible={this.state.showProfileModal}
            >
                <View style={{
                    height: 400,
                    backgroundColor: 'white',
                    // justifyContent: 'center',
                    // alignItems: 'center',
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                    <View style={{ height: 220 }}>
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
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text>Pat Charaporn</Text>
                        <Text note>ID patcharaporn</Text>
                    </View>
                    <View style={{ flex: 1}}>
                    </View>
                    <View
                        style={{
                            borderWidth: 1, borderColor: '#fdfdfd', flexDirection: 'row',
                            justifyContent: 'center', alignItems: 'flex-end', padding: 15
                        }}
                    >
                        <Button transparent style={{ flexDirection: 'column' }}>
                            <Icon name='md-person' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>Edit Profile</Text>
                        </Button>
                        <Button transparent style={{ flexDirection: 'column', marginLeft: 10 }}>
                            <Icon name='md-cloud-download' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>KEEP</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
            <Modal
                onRequestClose={() => this.setState({ showFriendModal: false })}
                onBackdropPress={() => this.setState({ showFriendModal: false })}
                isVisible={this.state.showFriendModal}
            >
                <View style={{
                    height: 400,
                    backgroundColor: 'white',
                    // justifyContent: 'center',
                    // alignItems: 'center',
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                    <View style={{ height: 220 }}>
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
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text>Smnodame</Text>
                        <Text note>ID smnodame</Text>
                    </View>
                    <View style={{ flex: 1}}>
                    </View>
                    <View
                        style={{
                            borderWidth: 1, borderColor: '#fdfdfd', flexDirection: 'row',
                            justifyContent: 'center', alignItems: 'flex-end', padding: 15
                        }}
                    >
                        <Button transparent style={{ flexDirection: 'column' }}>
                            <Icon name='md-chatboxes' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>CHAT</Text>
                        </Button>
                        <Button transparent style={{ flexDirection: 'column', marginLeft: 10 }}>
                            <Icon name='md-call' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>FREE CALL</Text>
                        </Button>
                        <Button transparent style={{ flexDirection: 'column', marginLeft: 10 }}>
                            <Icon name='md-heart-outline' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>FAVORITES</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
            <Modal
                onRequestClose={() => this.setState({ showGroupModal: false })}
                onBackdropPress={() => this.setState({ showGroupModal: false })}
                isVisible={this.state.showGroupModal}
            >
                <View style={{
                    height: 400,
                    backgroundColor: 'white',
                    // justifyContent: 'center',
                    // alignItems: 'center',
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                    <View style={{ height: 220 }}>
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
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text>Traveling</Text>
                    </View>
                    <View style={{ flex: 1}}>
                    </View>
                    <View
                        style={{
                            borderWidth: 1, borderColor: '#fdfdfd', flexDirection: 'row',
                            justifyContent: 'center', alignItems: 'flex-end', padding: 15
                        }}
                    >
                        <Button transparent style={{ flexDirection: 'column' }}>
                            <Icon name='md-chatboxes' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>CHAT</Text>
                        </Button>
                        <Button transparent style={{ flexDirection: 'column', marginLeft: 10 }}>
                            <Icon name='md-settings' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>EDIT GROUP</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
            <View style={styles.searchContainer}>
              <RkTextInput autoCapitalize='none'
                           autoCorrect={false}
                           onChange={(event) => this._filter(event.nativeEvent.text)}
                           label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                           rkType='row'
                           placeholder='Search'/>
            </View>
            <View
                style={{
                    paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                    backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                    borderBottomWidth: 0.5
                }}
            >
                <RkText rkType='header6 hintColor'>Profile</RkText>
            </View>
            <View style={{ backgroundColor: 'white' }}>
                <TouchableOpacity onPress={() => this.setState({ showProfileModal: true })}>
                  <View style={styles.container}>
                      <Thumbnail  style={styles.avatar}  source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg'}} />
                      <RkText rkType='header5'>Smnodame</RkText>
                  </View>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                    backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                    borderBottomWidth: 0.5
                }}
            >
                <RkText rkType='header6 hintColor'>Favorites</RkText>
            </View>
            <View style={{ backgroundColor: 'white' }}>
                <TouchableOpacity onPress={() => this.setState({ showFriendModal: true })}>
                  <View style={styles.container}>
                      <Thumbnail  style={styles.avatar}  source={{ uri: 'https://pbs.twimg.com/profile_images/733975023065563136/iqPHvjhs_400x400.jpg'}} />
                      <RkText rkType='header5'>Pat Charaporn</RkText>
                  </View>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                    backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                    borderBottomWidth: 0.5
                }}
            >
                <RkText rkType='header6 hintColor'>Groups</RkText>
            </View>
            <View style={{ backgroundColor: 'white' }}>
                <TouchableOpacity onPress={() => this.setState({ showGroupModal: true })}>
                  <View style={styles.container}>
                      <Thumbnail  style={styles.avatar}  source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg'}} />
                      <RkText rkType='header5'>Travel</RkText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ showGroupModal: true })}>
                  <View style={styles.container}>
                      <Thumbnail  style={styles.avatar}  source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg'}} />
                      <RkText rkType='header5'>Dinner</RkText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ showGroupModal: true })}>
                  <View style={styles.container}>
                      <Thumbnail  style={styles.avatar}  source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg' }} />
                      <RkText rkType='header5'>Sport</RkText>
                  </View>
                </TouchableOpacity>
            </View>
            <View>
                <View
                    style={{
                        paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                        backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                        borderBottomWidth: 0.5
                    }}
                >
                    <RkText rkType='header6 hintColor'>Friends</RkText>
                </View>
                <ListView
                    style={styles.root}
                    dataSource={this.state.data}
                    renderRow={this.renderRow}
                    renderSeparator={this.renderSeparator}
                    enableEmptySections={true}
                />
            </View>
        </View>
    )
  }
}
// renderHeader={this.renderHeader}
let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center'
  },
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  avatar: {
    marginRight: 16
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base
  }
}));
