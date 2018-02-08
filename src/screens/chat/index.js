import React from 'react';
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Keyboard,
  Modal as ModalNative
} from 'react-native';
import { InteractionManager, WebView } from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';
import Modal from 'react-native-modal';
import _ from 'lodash';
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
import realm from '../../data/realm/realm';
import {FontAwesome} from '../../assets/icons';
import {data} from '../../data';
import {scale} from '../../utils/scale';
import GridView from 'react-native-super-grid';

import {store} from '../../redux'
import { onLoadMoreMessageLists, onFetchInviteFriend, loadMoreInviteFriends, onInviteFriendToGroup } from '../../redux/actions'
import {sendTheMessage} from '../../redux/api'
import { emit_update_friend_chat_list, emit_unsubscribe, emit_message } from '../../redux/socket.js'

import ImagePicker from 'react-native-image-picker'

import { NavigationActions } from 'react-navigation'
let moment = require('moment');

import * as mime from 'react-native-mime-types'
import RNFetchBlob from 'react-native-fetch-blob'

import ImageView from 'react-native-image-view'

let getUserId = (navigation) => {
  return navigation.state.params ? navigation.state.params.userId : undefined;
}

export default class Chat extends React.Component {

    constructor(props) {
        super(props);

        // let conversation = data.getConversation(getUserId(this.props.navigation));
        let conversation = data.getConversation();

        this.state = {
            data: conversation,
            isShowAdditionalHeader: false,
            collectionKeySelected: 0,
            showImageView: false,
            page: 0
        }

        this._renderItem = this._renderItem.bind(this)
    }

    updateData = () => {
        const state = store.getState()

        this.setState({
            chat: _.get(state, 'chat.chat', []),
            chatInfo: _.get(state, 'chat.chatInfo'),
            user: _.get(state, 'user.user'),
            sticker: _.get(state, 'chat.sticker', []),
            isGroup: _.get(state, 'chat.chatInfo.friend_user_id', 'F')[0] == 'G',
            inviteFriends: _.get(state, 'chat.inviteFriends.data', [])
        })
        // this.flatListRef.scrollToIndex({animated: true, index: "" + randomIndex})
        console.log(data)
    }

	async componentWillMount() {
        this.updateData()
		store.subscribe(() => {
            this.updateData()
		})
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    loadMoreInviteFriendLists = () => {
        const page = this.state.page + 30
        this.setState({
            page: page + 1
        })
        store.dispatch(loadMoreInviteFriends(page, this.state.inviteFriendSeachText))
    }

    _renderItem(info) {
        let inMessage = info.item.username != this.state.user.username;
        let seenMessage = ''
        const reader = info.item.who_read.filter((id) => {
            return id != this.state.user.user_id
        })
        if(this.state.isGroup && reader.length != 0) {
            seenMessage = `seen by ${reader.length}`
        } else if(!this.state.isGroup && reader.length != 0){
            seenMessage = `seen`
        }
        let backgroundColor = inMessage
            ? RkTheme.current.colors.chat.messageInBackground
                : RkTheme.current.colors.chat.messageOutBackground;
        let itemStyle = inMessage ? styles.itemIn : styles.itemOut;

        let renderDate = (date) => (
        <View>
            <RkText style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }} rkType='secondary7 hintColor'>
                { `${moment(date).fromNow()}` }
            </RkText>
            {
                (!inMessage||this.state.isGroup)&&<RkText style={{ marginLeft: 15, paddingRight: 30, width: '100%', textAlign: inMessage? 'left' : 'right' }} rkType='secondary7 hintColor'>
                    {
                        seenMessage
                    }
                </RkText>
            }
        </View>
    );

    return (
        <TouchableWithoutFeedback

            key={info.item.chat_message_id}
            onPress={() => {
                this.setState({
                    isShowPhoto: false,
                    isShowRecord: false,
                    isShowAdditionalHeader: false
                })
                Keyboard.dismiss()
            }}
        >
            <View style={{  width: '100%'}}>
            <View style={[styles.item, itemStyle]}>
          {!inMessage && renderDate(info.item.create_date)}
          {
              info.item.message_type=='1' && <View style={[styles.balloon, {backgroundColor}]}>
                  <TouchableWithoutFeedback onLongPress={() => this.setState({showPickerModal: true})}>
                      <RkText rkType='primary2 mediumLine chat'>{info.item.content}</RkText>
                  </TouchableWithoutFeedback>
              </View>
          }
          {
              info.item.message_type=='2' && <TouchableWithoutFeedback
                  onPress={() => {
                      this.setState({
                          selectedPhotoUrl: info.item.object_url
                      })
                      this.setState({
                          showImageView: true
                      })
                  }}
              >
                  <Image
                      style={{ height: 120, width: 120 }}
                      source={{uri: info.item.object_url }}
                      resizeMethod={'resize'}
                  />
              </TouchableWithoutFeedback>
          }
          {
              info.item.message_type=='4' && <Image
                  style={{ height: 100, width: 100 }}
                  source={{uri: info.item.object_url }}
              />
          }
          {
              info.item.message_type=='3' &&
              <View style={[styles.balloon, { width: 150, height: 100 }, {backgroundColor}, { padding: 5 }]}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                      <View style={{ flex: 1, borderColor: '#C0C0C0', borderBottomWidth: 0.5, marginBottom: 2, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#C0C0C0', fontSize: 20 }}>10:50</Text>
                      </View>
                      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                          <View style={{ flex: 1, borderColor: '#C0C0C0', borderRightWidth: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                              <Button iconLeft transparent style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}>
                                  <Icon name='md-play' style={{ color: '#C0C0C0' }}/>
                              </Button>
                          </View>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                              <Button iconLeft transparent style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}>
                                  <Icon name='md-download' style={{ color: '#C0C0C0' }}/>
                              </Button>
                          </View>
                      </View>
                  </View>
              </View>

          }
          {
              info.item.message_type=='5' && <View style={[styles.balloon, {backgroundColor}]}>
                  <TouchableWithoutFeedback
                      onPress={() => {
                          const url = info.item.object_url
                          const arr = url.split('.')
                          const filetype = arr[arr.length - 1]

                          RNFetchBlob
                          .config({
                              addAndroidDownloads : {
                                  useDownloadManager : true, // <-- this is the only thing required
                                  // Optional, override notification setting (default to true)
                                  notification : true,
                                  // Optional, but recommended since android DownloadManager will fail when
                                  // the url does not contains a file extension, by default the mime type will be text/plain
                                  title: info.item.file_name,
                                  mime : mime.lookup(filetype),
                                  description : 'File downloaded by download manager.'
                              }
                          })
                          .fetch('GET', url)
                          .then((resp) => {
                            // the path of downloaded file
                            resp.path()
                          })
                      }}
                  >
                      <View style={{ flex: 1, flexDirection: 'row' }}>
                          <View style={{ width: 30 }}>
                              <Icon name='md-list-box' style={{ color: '#A9A9A9' }}/>
                          </View>
                          <View>
                              <RkText rkType='primary2 mediumLine chat' style={{ marginBottom: 8, height: 22 }}>

                                  {  `${info.item.file_name}`}
                              </RkText>
                              <RkText rkType='secondary4 hintColor'>
                                  {  `file extension: ${info.item.file_extension}`}
                              </RkText>
                          </View>
                      </View>
                  </TouchableWithoutFeedback>
              </View>
          }
          {inMessage && renderDate(info.item.create_date)}
        </View>
        </View>
        </TouchableWithoutFeedback>
    )
  }

    _scroll() {

    }

    async _pushMessage() {
        if (!this.state.message)
            return
        const resSendTheMessage = await sendTheMessage(this.state.chatInfo.chat_room_id, '1', this.state.message, '', '')

        if(_.get(resSendTheMessage.data, 'error')) {
            return;
        }

        emit_update_friend_chat_list('3963', '3963')
        emit_message(this.state.message, this.state.chatInfo.chat_room_id)

        this.setState({
            message: ''
        })

        this._scroll(true)
    }

    async _pushSticker(sticker_path) {
        const resSendTheMessage = await sendTheMessage(this.state.chatInfo.chat_room_id, '4', '', sticker_path, '')

        if(_.get(resSendTheMessage.data, 'error')) {
            return;
        }

        emit_update_friend_chat_list('3963', '3963')
        emit_message(this.state.message, this.state.chatInfo.chat_room_id)

        this.setState({
            message: ''
        })

        this._scroll(true)

    }

    async _pushPhoto(base64) {
        const resSendTheMessage = await sendTheMessage(this.state.chatInfo.chat_room_id, '2', '', '', base64)

        if(_.get(resSendTheMessage.data, 'error')) {
            return;
        }

        emit_update_friend_chat_list('3963', '3963')
        emit_message(this.state.message, this.state.chatInfo.chat_room_id)

        this.setState({
            message: ''
        })

        this._scroll(true)

    }

  render() {
    return (
        <Container>
            <Header style={{ backgroundColor: '#3b5998' }}>
                <Left>
                    <Button transparent onPress={() => {
                        emit_unsubscribe(this.state.chatInfo.chat_room_id)
                        this.props.navigation.dispatch(NavigationActions.back())
                    }}>
                        <Icon style={{ color: 'white' }} name="md-arrow-round-back" />
                    </Button>
                </Left>
                <Body>
                    <Title>{ _.get(this.state, 'chatInfo.display_name', '') }</Title>
                </Body>
                <Right>
                    <Button transparent>
                        <Icon style={{ color: 'white' }} name="md-call" />
                    </Button>
                    <Button transparent onPress={() =>
                        this.setState({
                            isShowAdditionalHeader: !this.state.isShowAdditionalHeader,
                            isShowPhoto: false,
                            isShowRecord: false
                        })
                    }>
                        <Icon style={{ color: 'white' }} name="md-settings" />
                    </Button>
                </Right>
            </Header>
            {
                this.state.showInviteModal && <ModalNative
                    onRequestClose={() => this.setState({ showInviteModal: false })}
                    onBackdropPress={() => this.setState({ showInviteModal: false })}
                    isVisible={true}
                >
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 4,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                        <Header style={{ backgroundColor: '#3b5998' }}>
                            <Left>
                                <Button transparent onPress={() => {
                                    this.setState({ showInviteModal: false })
                                }}>
                                    <Icon style={{ color: 'white' }} name="md-close" />
                                </Button>
                            </Left>
                            <Body>
                                <Title>Invite</Title>
                            </Body>
                            <Right>

                            </Right>
                        </Header>
                        <View style={[styles.searchContainer, { borderRadius: 4 }]}>
                          <RkTextInput autoCapitalize='none'
                                       autoCorrect={false}
                                       onSubmitEditing={() => {
                                           store.dispatch(onFetchInviteFriend(this.state.inviteFriendSeachText))
                                       }}
                                       onChangeText={(inviteFriendSeachText) => this.setState({
                                           inviteFriendSeachText
                                       })}
                                       label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                                       rkType='row'
                                       placeholder='Search'/>
                        </View>
                        <View style={{ marginBottom: 40 }}>
                            <List>
                                <FlatList
                                    data={this.state.inviteFriends}
                                    onEndReached={() => this.loadMoreInviteFriendLists()}
                                    onEndReachedThreshold={0.4}
                                    renderItem={({item}) => (
                                        <ListItem avatar onPress={() => {
                                            store.dispatch(onInviteFriendToGroup(this.state.chatInfo.chat_room_id, item.friend_user_id))
                                        }}>
                                            <Left>
                                                <Thumbnail source={{ uri: item.profile_pic_url }} />
                                            </Left>
                                            <Body>
                                                <Text>{ item.display_name }</Text>
                                                <Text note style={{ marginLeft: 2 }}>{ item.status_quote }</Text>
                                            </Body>
                                        </ListItem>
                                    )}
                                />
                            </List>
                        </View>
                    </View>
                </ModalNative>
            }
            {
                this.state.showRemoveInviteModal && <Modal
                    onRequestClose={() => this.setState({ showRemoveInviteModal: false })}
                    onBackdropPress={() => this.setState({ showRemoveInviteModal: false })}
                    isVisible={true}
                >
                    <View style={{
                        height: 400,
                        backgroundColor: 'white',
                        borderRadius: 4,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                        <View style={[styles.searchContainer, { borderRadius: 4 }]}>
                          <RkTextInput autoCapitalize='none'
                                       autoCorrect={false}
                                       label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                                       rkType='row'
                                       placeholder='Search'/>
                        </View>
                        <ScrollView>
                            <List>
                                <ListItem avatar>
                                    <Left>
                                        <Thumbnail source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg' }} />
                                    </Left>
                                    <Body>
                                        <Text>Kumar Pratik</Text>
                                        <Text note>Doing what you like will always keep you happy . .</Text>
                                    </Body>
                                    <Right style={{justifyContent: 'center', alignItems: 'center'}}>
                                        <RkButton style={styles.plus} rkType='clear'>
                                            <Icon ios={'md-remove-circle'} android={'md-remove-circle'} style={{fontSize: 20, color: 'gray'}}/>
                                        </RkButton>
                                    </Right>
                                </ListItem>
                            </List>
                        </ScrollView>
                    </View>
                </Modal>
            }
            {
                this.state.showOpenCaseModal && <Modal
                    onRequestClose={() => this.setState({ showOpenCaseModal: false })}
                    onBackdropPress={() => this.setState({ showOpenCaseModal: false })}
                    isVisible={true}
                >
                    <View style={{
                        height: 400,
                        backgroundColor: 'white',
                        borderRadius: 4,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                        <View style={[styles.searchContainer, { borderRadius: 4 }]}>
                          <RkTextInput autoCapitalize='none'
                                       autoCorrect={false}
                                       label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                                       rkType='row'
                                       placeholder='Search'/>

                        </View>
                        <ScrollView>
                            <List>
                                <ListItem avatar>
                                    <Left>
                                        <Thumbnail source={{ uri: 'https://www.billboard.com/files/styles/480x270/public/media/taylor-swift-1989-tour-red-lipstick-2015-billboard-650.jpg' }} />
                                    </Left>
                                    <Body>
                                        <Text>Kumar Pratik</Text>
                                        <Text note>Doing what you like will always keep you happy . .</Text>
                                    </Body>
                                    <Right style={{justifyContent: 'center', alignItems: 'center'}}>
                                        <RkButton style={styles.plus} rkType='clear'>
                                            <Icon ios={'md-person-add'} android={'md-person-add'} style={{fontSize: 20, color: 'gray'}}/>
                                        </RkButton>
                                    </Right>
                                </ListItem>
                            </List>
                        </ScrollView>
                    </View>
                </Modal>
            }
            <Modal
                onRequestClose={() => this.setState({ showPickerModal: false })}
                onBackdropPress={() => this.setState({ showPickerModal: false })}
                isVisible={this.state.showPickerModal}
            >
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                  <Button block light>
                      <Text>COPY</Text>
                  </Button>
                  <Button block light>
                      <Text>SAVE IN KEEP</Text>
                  </Button>
                  <Button block light>
                      <Text>DELETE MESSEGES</Text>
                  </Button>
                  <Button block light>
                      <Text>FORWORD</Text>
                  </Button>
                  <Button block light>
                      <Text>SHARE</Text>
                  </Button>
                </View>
            </Modal>
            <Modal
                onRequestClose={() => this.setState({ showGroupSetting: false })}
                onBackdropPress={() => this.setState({ showGroupSetting: false })}
                isVisible={this.state.showGroupSetting}
            >
                <View style={{
                    height: 400,
                    backgroundColor: 'white',
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
                        <View style={styles.row}>
                          <RkTextInput label='Display Name'
                                       value={'Boonprakit'}
                                       rkType='right clear'
                                       onChangeText={(text) => this.setState({firstName: text})}/>
                        </View>
                    </View>
                    <View style={{ flex: 1}}>
                    </View>
                    <View
                        style={{
                            width: '100%'
                        }}
                    >
                        <Button block style={{ backgroundColor: '#3b5998', margin: 5 }}>
                            <Text>UPDATE</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
            <RkAvoidKeyboard style={styles.container} onResponderRelease={(event) => {
              Keyboard.dismiss();
            }}>
            {
                this.state.isShowAdditionalHeader&&<View style={[styles.additionHeader, { backgroundColor: 'white',  borderColor: '#d3d3d3', borderBottomWidth: 0.5 }]}>
                    <GridView
                        itemWidth={70}
                        items={[
                            {
                                icon: 'md-person-add',
                                name: 'Invite',
                                event: () => {
                                    store.dispatch(onFetchInviteFriend())
                                    this.setState({ showInviteModal : true })
                                }
                            },
                            {
                                icon: 'md-remove-circle',
                                name: 'Remove Invite',
                                event: () => {
                                    this.setState({ showRemoveInviteModal : true })
                                }
                            },
                            {
                                icon: 'md-mail-open',
                                name: 'Open Case',
                                event: () => {
                                    this.setState({ showOpenCaseModal : true })
                                }
                            },
                            {
                                icon: 'md-search',
                                name: 'Search',
                                event: () => {

                                }
                            },
                            {
                                icon: 'md-settings',
                                name: 'Setting',
                                event: () => {
                                    this.setState({ showGroupSetting : true })
                                }
                            },
                            {
                                icon: 'md-log-out',
                                name: 'Exit Group',
                                event: () => {

                                }
                            }
                        ]}
                        renderItem={item => (
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <RkButton style={styles.plus} rkType='clear' onPress={item.event}>
                                    <Icon ios={item.icon} android={item.icon} style={{fontSize: 20, color: 'gray'}}/>
                                </RkButton>
                                <RkText rkType='secondary4 hintColor' style={{ textAlign: 'center'}}>
                                     { item.name }
                                </RkText>
                            </View>
                        )}
                    />
                </View>
            }
              <FlatList ref='list'
                        getItemLayout={(data, index) => (
                            {length: 100, offset: 100 * index, index}
                        )}
                        inverted={true}
                        onEndReached={() => {
                            store.dispatch(onLoadMoreMessageLists())
                        }}
                        onEndReachedThreshold={0.3}
                        keyExtractor={(post) => {
                            return post.chat_message_id
                        }}
                        extraData={this.state}
                        style={styles.list}
                        data={this.state.chat}
                        renderItem={this._renderItem.bind(this)}/>
              <View style={styles.footer}>
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear' onPress={() => this.setState({ isShowMedie: false })}>
                      <Icon ios='md-camera' android="md-arrow-dropleft-circle" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    !this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear' onPress={() => this.setState({ isShowMedie: true })}>
                        <Icon ios='md-camera' android="md-arrow-dropright-circle" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear' onPress={() => {
                        Keyboard.dismiss()
                        // Launch Camera:
                        ImagePicker.launchCamera({
                            title: 'Select Profile Image',
                            storageOptions: {
                              skipBackup: true,
                              path: 'images'
                          },
                          maxWidth: 300,
                          maxHeight: 300,
                          mediaType: 'photo',
                          noData: false
                        }, (response)  => {
                          // Same code as in above section!
                            if (response.didCancel) {
                                console.log('User cancelled image picker')
                            } else if (response.error) {
                                console.log('ImagePicker Error: ', response.error)
                            } else if (response.customButton) {
                                console.log('User tapped custom button: ', response.customButton)
                            } else {
                                this._pushPhoto(response.data)
                            }
                        });
                    }}>
                        <Icon ios='md-camera' android="md-camera" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear' onPress={() => {
                        Keyboard.dismiss()
                        // Launch Camera:
                        ImagePicker.launchImageLibrary({
                            title: 'Select Profile Image',
                            storageOptions: {
                              skipBackup: true,
                              path: 'images'
                          },
                          maxWidth: 300,
                          maxHeight: 300,
                          mediaType: 'photo',
                          noData: false
                        }, (response)  => {
                          // Same code as in above section!
                            if (response.didCancel) {
                                console.log('User cancelled image picker')
                            } else if (response.error) {
                                console.log('ImagePicker Error: ', response.error)
                            } else if (response.customButton) {
                                console.log('User tapped custom button: ', response.customButton)
                            } else {
                                this._pushPhoto(response.data)
                            }
                        });
                    }}>
                        <Icon ios='md-photos' android="md-photos" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear' onPress={() => {
                        Keyboard.dismiss()
                        this.setState({
                            isShowRecord: !this.state.isShowRecord,
                            isShowPhoto: false,
                            isShowAdditionalHeader: false
                        })
                    }}>
                        <Icon ios='attachment' android="md-mic" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear'>
                        <Icon ios='attachment' android="md-folder-open" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }

                <ImageView
                  source={{uri: this.state.selectedPhotoUrl}}
                  isVisible={this.state.showImageView}
                  onClose={() => {
                      this.setState({
                          showImageView: false
                      })
                  }}
                />

                <RkTextInput
                  onFocus={() => {
                      this._scroll(true)
                      this.setState({ isShowMedie: false, isShowPhoto: false })
                  }}
                  onBlur={() => this._scroll(true)}
                  onChangeText={(message) => this.setState({message})}
                  value={this.state.message}
                  rkType='row sticker'
                  placeholder="Add a comment..."/>
                  <RkButton style={styles.plus} rkType='clear' onPress={() => {
                      Keyboard.dismiss()
                      this.setState({ isShowPhoto: !this.state.isShowPhoto, isShowRecord: false, isShowAdditionalHeader: false })
                  }}>
                        <Icon ios='attachment' android="md-happy" style={{fontSize: 20, color: 'gray'}}/>
                  </RkButton>

                <RkButton onPress={() => this._pushMessage()} style={styles.send} rkType='circle highlight'>
                    <Image source={require('../../assets/icons/sendIcon.png')}/>
                </RkButton>
              </View>
              {
                  this.state.isShowPhoto&&<View style={{ height: 200 }}>
                        <GridView
                            itemWidth={70}
                            items={this.state.sticker[this.state.collectionKeySelected].sticker_lists}
                            renderItem={item => (
                                <View>
                                    <TouchableOpacity onPress={() => {
                                        this._pushSticker(item.path)
                                    }}>
                                        <Image
                                            style={{ height: 70 }}
                                            source={{uri: item.url}}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        <View style={[styles.footer, { backgroundColor: 'white',  borderColor: '#d3d3d3', borderTopWidth: 0.5, backgroundColor: '#d3d3d300' }]}>
                            <FlatList
                                horizontal={true}
                                data={this.state.sticker}
                                renderItem={({item}) => {
                                    return (
                                        <View style={{ marginRight: 12 }}>
                                            <TouchableOpacity onPress={() => {
                                                this.setState({
                                                    collectionKeySelected: item.key
                                                })
                                            }}>
                                                <Image
                                                    style={{ height: 40, width: 40 }}
                                                    source={{uri: item.collection_image_url}}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                  </View>
              }
              {
                  this.state.isShowRecord && <View style={{ height: 200, backgroundColor: '#f9f9f9' }}>
                        <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>0:00</Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#ff6666', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'white' }}>Record</Text>
                            </View>
                        </View>

                  </View>
              }
            </RkAvoidKeyboard>
        </Container>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  header: {
    alignItems: 'center'
  },
  additionHeader: {
      backgroundColor: 'white',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 999
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center'
  },
  avatar: {
    marginRight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  searchItemContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  list: {
    paddingHorizontal: 17
  },
  footer: {
    flexDirection: 'row',
    minHeight: 60,
    padding: 10,
    backgroundColor: theme.colors.screen.alter
  },
  item: {
    marginVertical: 14,
    flex: 1,
    flexDirection: 'row'
  },
  itemIn: {},
  itemOut: {
    alignSelf: 'flex-end'
  },
  balloon: {
    maxWidth: scale(250),
    padding: 15,
    borderRadius: 20,
  },
  time: {
    alignSelf: 'flex-end',
    margin: 15
  },
  plus: {
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
},
row: {
  flexDirection: 'row',
  paddingHorizontal: 17.5,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderColor: theme.colors.border.base,
  alignItems: 'center'
},
}));
