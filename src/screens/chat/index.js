import React from 'react'
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
  Modal as ModalNative,
  Clipboard,
  Share,
  NativeModules,
  PermissionsAndroid
} from 'react-native'
import { InteractionManager, WebView } from 'react-native'
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten'
import AudioPlayer from '../../components/audioPlayer'
import RoundCheckbox from 'rn-round-checkbox'
import Modal from 'react-native-modal'
import _ from 'lodash'
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
    Badge,
    Item,
    Input
} from 'native-base'
import {FontAwesome} from '../../assets/icons'
import {scale} from '../../utils/scale'
import GridView from 'react-native-super-grid'

import {store} from '../../redux'
import {
    onLoadMoreMessageLists,
    onFetchInviteFriend,
    loadMoreInviteFriends,
    onInviteFriendToGroup,
    onRemoveFriendFromGroup,
    onExitTheGroup,
    onFetchFriendInGroup,
    onLoadMoreMemberInGroup,
    onEnterOptionMessage,
    onLoadMoreOptionMessage,
    onInviteFriendToGroupWithOpenCase,
    onFetchMessageLists,
    isShowSearchBar,
    onForward,
    inviteFriends,
    chat
} from '../../redux/actions'
import {sendTheMessage, fetchFriendProfile, saveInKeep, sendFileMessage } from '../../redux/api'
import {
    emit_update_friend_chat_list,
    emit_unsubscribe,
    emit_message
} from '../../redux/socket.js'

import ImagePicker from 'react-native-image-picker'
const FilePickerManager = NativeModules.FilePickerManager

import { NavigationActions } from 'react-navigation'
let moment = require('moment')

import * as mime from 'react-native-mime-types'
import RNFetchBlob from 'react-native-fetch-blob'

import ImageView from 'react-native-image-view'

import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'

let getUserId = (navigation) => {
  return navigation.state.params ? navigation.state.params.userId : undefined
}
const audioName = 'audio.wav'

export default class Chat extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isShowAdditionalHeader: false,
            collectionKeySelected: 0,
            showImageView: false,
            page: 0,
            selectedOptionMessageId: {},
            filterMessage: '',
            currentTime: 0.0,
            recording: false,
            paused: false,
            stoppedRecording: false,
            finished: false,
            audioPath: AudioUtils.DocumentDirectoryPath + '/' + audioName,
            hasPermission: undefined,
            roundRecording: 0
        }

        this._renderItem = this._renderItem.bind(this)
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    componentDidMount() {
        this._checkPermission().then((hasPermission) => {
            this.setState({ hasPermission })

            if (!hasPermission)
                return
            this.prepareRecordingPath(this.state.audioPath)
            AudioRecorder.onProgress = (data) => {
                this.setState({currentTime: Math.floor(data.currentTime)})
            }

            AudioRecorder.onFinished = (data) => {
                // Android callback comes in the form of a promise instead.
                if (Platform.OS === 'ios') {
                    this._finishRecording(data.status === "OK", data.audioFileURL)
                }
            }
        })
    }

    updateData = () => {
        const state = store.getState()
        this.setState({
            chat: _.get(state, 'chat.chat', []),
            chatInfo: _.get(state, 'chat.chatInfo', {
                chat_room_type: this.props.navigation.state.params.chat_room_type
            }),
            isGroup: _.get(state, 'chat.chatInfo.friend_user_id', 'F')[0] == 'G',
            inviteFriends: _.get(state, 'chat.inviteFriends.data', []),
            member: _.get(state, 'chat.memberInGroup.data', []),
            optionMessage: _.get(state, 'chat.optionMessage', []),
            isShowSearchBar: _.get(state, 'chat.isShowSearchBar', false)
        })
    }

    _finishRecording = (didSucceed, filePath) => {
        this.setState({ finished: didSucceed })
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`)
        this.setState({
            roundRecording: this.state.roundRecording + 1
        })
    }

    _record = async () => {
        if (this.state.recording) {
            console.warn('Already recording!')
            return
        }

        if (!this.state.hasPermission) {
            console.warn('Can\'t record, no permission granted!')
            return
        }

        if(this.state.stoppedRecording){
            this.prepareRecordingPath(this.state.audioPath)
        }

        this.setState({recording: true, paused: false})
        try {
            const filePath = await AudioRecorder.startRecording()
        } catch (error) {
            console.error(error)
        }
    }

    _stop = async () => {
        if (!this.state.recording) {
            console.warn('Can\'t stop, not recording!')
            return
        }

        this.setState({stoppedRecording: true, recording: false, paused: false})

        try {
            const filePath = await AudioRecorder.stopRecording()
            if (Platform.OS === 'android') {
                this._finishRecording(true, filePath)
        }
            return filePath
        } catch (error) {
            console.error(error)
        }
    }

    prepareRecordingPath = (audioPath) => {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "wav",
            AudioEncodingBitRate: 32000
        })
    }

    _checkPermission() {
        if (Platform.OS !== 'android') {
            return Promise.resolve(true)
        }

        const rationale = {
            'title': 'Microphone Permission',
            'message': 'AudioExample needs access to your microphone so you can record audio.'
        }

        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
            .then((result) => {
                console.log('Permission result:', result)
                return (result === true || result === PermissionsAndroid.RESULTS.GRANTED)
            })
    }

    initState = () => {
        const state = store.getState()

        const inviteAction = {
            icon: 'md-person-add',
            name: 'Invite',
            event: () => {
                new Promise(() => {
                    store.dispatch(onFetchInviteFriend())
                })
                this.setState({
                    showInviteModal : true,
                    isOpenCase: false
                })
            }
        }
        const friendsAction = {
            icon: 'md-contacts',
            name: 'member',
            event: () => {
                new Promise(() => {
                    store.dispatch(onFetchFriendInGroup())
                })
                this.setState({ showMemberModal : true })
            }
        }
        const openCaseAction = {
            icon: 'md-mail-open',
            name: 'Open Case',
            event: () => {
                new Promise(() => {
                    store.dispatch(onFetchInviteFriend())
                })
                this.setState({
                    showInviteModal : true,
                    isOpenCase: true
                })
            }
        }
        const searchAction = {
            icon: 'md-search',
            name: 'Search',
            event: () => {
                this.setState({
                    isShowAdditionalHeader: false
                })
                new Promise(() => {
                    store.dispatch(isShowSearchBar(true))
                })
            }
        }
        const settingAction = {
            icon: 'md-settings',
            name: 'Setting',
            event: () => {
                this.props.navigation.navigate('GroupSetting', {
                    selectedFriend: {
                        display_name: _.get(this.state.chatInfo, 'display_name', ''),
                        wall_pic_url: _.get(this.state.chatInfo, 'friend_wall_pic_url', ''),
                        profile_pic_url: _.get(this.state.chatInfo, 'profile_pic_url', ''),
                        c_patient_name: _.get(this.state.chatInfo, 'patient_name', ''),
                        c_hn: _.get(this.state.chatInfo, 'hn', ''),
                        c_description: _.get(this.state.chatInfo, 'description', ''),
                        chat_room_id: _.get(this.state.chatInfo, 'chat_room_id', ''),
                        chat_room_type: _.get(this.state.chatInfo, 'chat_room_type', 'Z')
                    },
                    saveGroupSetting: () => {

                    }
                })
            }
        }
        const existGroupAction = {
            icon: 'md-log-out',
            name: 'Leave',
            event: () => {
                store.dispatch(onExitTheGroup(this.state.chatInfo.chat_room_id))
            }
        }
        let options = []
        if(this.props.navigation.state.params.chat_room_type == 'G' || this.props.navigation.state.params.chat_room_type == 'C') {
            options = options.concat([inviteAction, friendsAction, searchAction, settingAction, existGroupAction])
        } else if(this.props.navigation.state.params.display_name.toLowerCase() == 'keep') {
            options = options.concat([searchAction])
        } else {
            options = options.concat([inviteAction, openCaseAction, searchAction])
        }

        this.setState({
            user: _.get(state, 'user.user'),
            sticker: _.get(state, 'chat.sticker', []),
            optionLists: options,
        })
    }

	async componentWillMount() {
        this.initState()
		this.unsubscribe = store.subscribe(() => {
            this.updateData()
		})
    }

    componentDidUpdate(prevProps, prevState) {

    }

    loadMoreInviteFriendLists = () => {
        store.dispatch(loadMoreInviteFriends(0, this.state.inviteFriendSeachText))
    }

    onLoadMoreMemberInGroup = () => {
        store.dispatch(onLoadMoreMemberInGroup(this.state.memberSeachText))
    }

    _resend = () => {
        this.setState({
            showHandleError: false
        }, () => {
            const {
                message,
                index
            } = this.state.selectedMessageError

            const messageLists = this.state.chat
            messageLists.splice(index, 1)
            store.dispatch(chat(messageLists))

            if (message.message_type == '1') {
                this._pushMessage(message.content)
            } else if (message.message_type == '2') {
                this._pushPhoto(message.base64, message.object_url)
            } else if (message.message_type == '3') {
                this._pushAudio()
            } else if (message.message_type == '4') {
                this._pushSticker(message.sticker_path, message.object_url)
            } else if (message.message_type == '5') {
                this._pushFile({
                    uri: message.object_url,
                    fileName: message.file_name,
                    type: message.file_extension
                })
            }
        })
    }

    _deleteErrorMessage = () => {
        this.setState({
            showHandleError: false
        }, () => {
            const {
                message,
                index
            } = this.state.selectedMessageError

            const messageLists = this.state.chat
            messageLists.splice(index, 1)
            store.dispatch(chat(messageLists))
        })
    }

    _renderItem(info) {
        let inMessage = info.item.username != this.state.user.username
        let seenMessage = ''
        const isError = _.get(info.item, 'isError', false)
        const reader = info.item.who_read.filter((id) => {
            return id != this.state.user.user_id
        })
        if((this.props.navigation.state.params.chat_room_type == 'G' || this.props.navigation.state.params.chat_room_type == 'C') && reader.length != 0) {
            seenMessage = `seen by ${reader.length}`
        } else if(reader.length != 0){
            seenMessage = `seen`
        }
        let backgroundColor = inMessage
            ? RkTheme.current.colors.chat.messageInBackground
                : RkTheme.current.colors.chat.messageOutBackground
        let itemStyle = inMessage ? styles.itemIn : styles.itemOut

        let renderDate = (date) => (
        <View>
            <RkText style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }} rkType='secondary7 hintColor'>
                { `${moment(date).fromNow()}` }
            </RkText>
            {
                (!inMessage||(this.props.navigation.state.params.chat_room_type == 'G' || this.props.navigation.state.params.chat_room_type == 'C'))&&<RkText style={{ marginLeft: 15, paddingRight: 30, width: '100%', textAlign: inMessage? 'left' : 'right' }} rkType='secondary7 hintColor'>
                    {
                        seenMessage
                    }
                </RkText>
            }
            {
                !inMessage && isError && <View style={{ marginRight: 20  }}>
                    <TouchableOpacity
                        style={{ width: '100%', flexDirection: 'row' }}
                        onPress={() => {
                            this.setState({
                                showHandleError: true,
                                selectedMessageError: {
                                    message: info.item,
                                    index: info.index
                                }
                            })
                        }}
                    >
                        <View style={{ flex: 1 }} />
                        <Icon
                            style={{ color: '#A9A9A9' }}
                            name='md-information-circle'
                        />
                    </TouchableOpacity>
                </View>

            }
        </View>
    )
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
            <View style={{  width: '100%' }}>

            <View style={[styles.item, itemStyle]}>

            {
                this.state.showOptionMessageModal && <View style={{ marginRight: 8, marginTop: 5 }}>
                    <RoundCheckbox
                        size={24}
                        checked={_.get(this.state.selectedOptionMessageId, info.item.chat_message_id, false)}
                        onValueChange={(newValue) => {
                            const selectedOptionMessageId = {}
                            _.set(this.state.selectedOptionMessageId, info.item.chat_message_id, newValue)
                            this.setState({
                                selectedOptionMessageId: Object.assign(this.state.selectedOptionMessageId, selectedOptionMessageId, {})
                            })
                        }}
                    />
                </View>
            }

            {
                !inMessage && this.state.showOptionMessageModal && <View style={{ flex: 1 }} />
            }

            {inMessage && <Thumbnail small source={{ uri: info.item.profile_pic_url }} style={{ marginRight: 8, marginTop: 5 }}/>}
            {!inMessage && renderDate(info.item.create_date)}
          {
              info.item.message_type=='1' && <View style={[styles.balloon, {backgroundColor}]}>
                  <TouchableWithoutFeedback onLongPress={() => {
                      if(isError) {
                          return
                      }
                      this.setState({ showPickerModal: true, copiedText: info.item.content, selectedMessageId: info.item.chat_message_id, selectedMessageType: info.item.message_type })
                  }}>
                      <RkText rkType='primary2 mediumLine chat'>{info.item.content}</RkText>
                  </TouchableWithoutFeedback>
              </View>
          }
          {
              info.item.message_type=='2' && <TouchableWithoutFeedback
                onLongPress={() => {
                    if(isError) {
                        return
                    }
                    this.setState({
                        showPickerModal: true,
                        selectedMessageId: info.item.chat_message_id,
                        selectedMessageType: info.item.message_type
                    })
                }}
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
              info.item.message_type=='4' && <TouchableWithoutFeedback
                  onLongPress={() => {
                      if(isError) {
                          return
                      }
                      this.setState({
                          showPickerModal: true,
                          selectedMessageId: info.item.chat_message_id,
                          selectedMessageType: info.item.message_type
                      })
                  }}
              >
                  <Image
                      style={{ height: 100, width: 100 }}
                      source={{uri: info.item.object_url }}
                  />
              </TouchableWithoutFeedback>
          }
          {
              info.item.message_type=='3' &&   <View style={[styles.balloon, { width: 150, height: 100 }, {backgroundColor},  { padding: 5 }]}>
                <TouchableWithoutFeedback
                    style={{ backgroundColor: 'yellow'}}
                    onLongPress={() => {
                        if(isError) {
                            return
                        }
                        this.setState({
                            showPickerModal: true,
                            selectedMessageId: info.item.chat_message_id,
                            selectedMessageType: info.item.message_type
                        })
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <AudioPlayer fileName={info.item.file_name} url={info.item.object_url} backgroundColor={backgroundColor} />
                    </View>
                </TouchableWithoutFeedback>
                </View>
          }
          {
              info.item.message_type=='5' && <View style={[styles.balloon, {backgroundColor}]}>
                  <TouchableWithoutFeedback
                      onLongPress={() => {
                          if(isError) {
                              return
                          }
                          this.setState({
                              showPickerModal: true,
                              selectedMessageId: info.item.chat_message_id,
                              selectedMessageType: info.item.message_type
                          })
                      }}

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
                              <RkText rkType='primary2 mediumLine chat' numberOfLines={1} style={{ marginBottom: 8, height: 22 }}>
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
    )}

    _scroll() {

    }

    _openFilePicker = async () => {
        FilePickerManager.showFilePicker(null, (response) => {
            console.log('Response = ', response)

            if (response.didCancel) {
                console.log('User cancelled file picker')
            } else if (response.error) {
                console.log('FilePickerManager Error: ', response.error)
            } else {
                this.setState({
                    file: response
                })
                this._pushFile(response)
                console.log('finished send message as file type ')
            }
        })
    }

    generateID = () => {
        return '_' + Math.random().toString(36).substr(2, 9)
    }

    async _pushMessage(message) {
        if (!message)
            return

        const draft_message_id = this.generateID()
        // send local message
        const draftMessage = {
            chat_message_id: draft_message_id,
            draft_message_id: draft_message_id,
            content: message,
            username: this.state.user.username,
            who_read: [],
            create_date: new Date(),
            profile_pic_url: this.state.user.profile_pic_url,
            message_type: '1',
            isError: false
        }

        this.setState({
            message: ''
        })

        const messageLists = _.get(this.state, 'chat', [])
        const chatData = [draftMessage].concat(messageLists)
        store.dispatch(chat(chatData))

        try {
            const resSendTheMessage = await sendTheMessage(this.state.chatInfo.chat_room_id, '1', message, '', '')
            if(_.get(resSendTheMessage, 'data.error') || resSendTheMessage.status != 200) {
                const indexLocal = chatData.findIndex((message) => {
                    return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
                })

                chatData[indexLocal].isError = true
                store.dispatch(chat(chatData))

                return;
            }

            const chat_message_id = _.get(resSendTheMessage, 'data.new_chat_message.chat_message_id')

            // update message for everyone in group
            emit_message(message, this.state.chatInfo.chat_room_id, this.state.user.user_id, chat_message_id, draft_message_id)

            // update our own
            emit_update_friend_chat_list(this.state.user.user_id, this.state.user.user_id)

            // update every friends in group
            if(this.state.chatInfo.chat_room_type == 'G' || this.state.chatInfo.chat_room_type == 'C') {
                const friend_user_ids = this.state.chatInfo.friend_user_ids.split(',')
                friend_user_ids.forEach((friend_user_id) => {
                    emit_update_friend_chat_list(this.state.user.user_id, friend_user_id)
                })
            } else {
                emit_update_friend_chat_list(this.state.user.user_id, this.state.chatInfo.friend_user_id)
            }

            this.setState({
                message: ''
            })

            this._scroll(true)
        } catch(err) {
            const indexLocal = chatData.findIndex((message) => {
                return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
            })

            chatData[indexLocal].isError = true
            store.dispatch(chat(chatData))

            return;
        }
    }

    async _pushSticker(sticker_path, object_url) {
        const draft_message_id = this.generateID()
        // send local message
        const draftMessage = {
            chat_message_id: draft_message_id,
            draft_message_id: draft_message_id,
            content: '',
            username: this.state.user.username,
            who_read: [],
            create_date: new Date(),
            profile_pic_url: this.state.user.profile_pic_url,
            message_type: '4',
            object_url: object_url,
            sticker_path: sticker_path,
            isError: false
        }

        this.setState({
            message: ''
        })

        const messageLists = _.get(this.state, 'chat', [])
        const chatData = [draftMessage].concat(messageLists)
        store.dispatch(chat(chatData))

        try {
            const resSendTheMessage = await sendTheMessage(this.state.chatInfo.chat_room_id, '4', '', sticker_path, '')
            if(_.get(resSendTheMessage, 'data.error') || resSendTheMessage.status != 200) {
                const indexLocal = chatData.findIndex((message) => {
                    return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
                })

                chatData[indexLocal].isError = true
                store.dispatch(chat(chatData))

                return
            }
            const chat_message_id = _.get(resSendTheMessage, 'data.new_chat_message.chat_message_id')
            // update message for everyone in group
            emit_message('', this.state.chatInfo.chat_room_id, this.state.user.user_id, chat_message_id, draft_message_id)

            // update our own
            emit_update_friend_chat_list(this.state.user.user_id, this.state.user.user_id)

            // update every friends in group
            const friend_user_ids = this.state.chatInfo.friend_user_ids.split(',')
            friend_user_ids.forEach((friend_user_id) => {
                emit_update_friend_chat_list(this.state.user.user_id, friend_user_id)
            })

            this.setState({
                message: ''
            })

            this._scroll(true)
        } catch(err) {
            const indexLocal = chatData.findIndex((message) => {
                return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
            })

            chatData[indexLocal].isError = true
            store.dispatch(chat(chatData))

            return
        }
    }

    async _pushPhoto(base64, object_url) {
        const draft_message_id = this.generateID()
        // send local message
        const draftMessage = {
            chat_message_id: draft_message_id,
            draft_message_id: draft_message_id,
            content: '',
            username: this.state.user.username,
            who_read: [],
            create_date: new Date(),
            profile_pic_url: this.state.user.profile_pic_url,
            message_type: '2',
            object_url: object_url,
            base64: base64,
            isError: false
        }

        const messageLists = _.get(this.state, 'chat', [])
        const chatData = [draftMessage].concat(messageLists)
        store.dispatch(chat(chatData))

        try {
            const resSendTheMessage = await sendTheMessage(this.state.chatInfo.chat_room_id, '2', '', '', base64)
            if(_.get(resSendTheMessage, 'data.error') || resSendTheMessage.status != 200) {
                const indexLocal = chatData.findIndex((message) => {
                    return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
                })

                chatData[indexLocal].isError = true
                store.dispatch(chat(chatData))

                return
            }
            const chat_message_id = _.get(resSendTheMessage, 'data.new_chat_message.chat_message_id')
            // update message for everyone in group
            emit_message('', this.state.chatInfo.chat_room_id, this.state.user.user_id, chat_message_id, draft_message_id)

            // update our own
            emit_update_friend_chat_list(this.state.user.user_id, this.state.user.user_id)

            // update every friends in group
            const friend_user_ids = this.state.chatInfo.friend_user_ids.split(',')
            friend_user_ids.forEach((friend_user_id) => {
                emit_update_friend_chat_list(this.state.user.user_id, friend_user_id)
            })

            this.setState({
                message: ''
            })

            this._scroll(true)
        } catch(err) {
            const indexLocal = chatData.findIndex((message) => {
                return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
            })

            chatData[indexLocal].isError = true
            store.dispatch(chat(chatData))

            return
        }
    }

    async _pushFile(file) {

        const draft_message_id = this.generateID()
        // send local message
        const draftMessage = {
            chat_message_id: draft_message_id,
            draft_message_id: draft_message_id,
            content: '',
            username: this.state.user.username,
            who_read: [],
            create_date: new Date(),
            profile_pic_url: this.state.user.profile_pic_url,
            message_type: '5',
            object_url: file.uri,
            file_name: file.fileName,
            file_extension: file.type,
            isError: false
        }

        const messageLists = _.get(this.state, 'chat', [])
        const chatData = [draftMessage].concat(messageLists)
        store.dispatch(chat(chatData))

        try {
            const resSendTheMessage = await sendFileMessage(this.state.chatInfo.chat_room_id, '5', {
                fileName: file.fileName,
                type: file.type,
                uri: file.uri
            })
            if(_.get(resSendTheMessage, 'error') || !resSendTheMessage) {
                const indexLocal = chatData.findIndex((message) => {
                    return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
                })

                chatData[indexLocal].isError = true
                store.dispatch(chat(chatData))
                return
            }
            const chat_message_id = _.get(resSendTheMessage, 'new_chat_message.chat_message_id')

            // update message for everyone in group
            emit_message('', this.state.chatInfo.chat_room_id, this.state.user.user_id, chat_message_id, draft_message_id)

            // update our own
            emit_update_friend_chat_list(this.state.user.user_id, this.state.user.user_id)

            // update every friends in group
            const friend_user_ids = this.state.chatInfo.friend_user_ids.split(',')
            friend_user_ids.forEach((friend_user_id) => {
                emit_update_friend_chat_list(this.state.user.user_id, friend_user_id)
            })

            this.setState({
                message: ''
            })
        } catch(err) {
            const indexLocal = chatData.findIndex((message) => {
                return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
            })

            chatData[indexLocal].isError = true
            store.dispatch(chat(chatData))
            return
        }
    }

    async _pushAudio() {
        const uri = Platform.OS !== 'android'? AudioUtils.DocumentDirectoryPath + '/' + audioName : 'file://' + AudioUtils.DocumentDirectoryPath + '/' + audioName

        const draft_message_id = this.generateID()
        // send local message
        const draftMessage = {
            chat_message_id: draft_message_id,
            draft_message_id: draft_message_id,
            content: '',
            username: this.state.user.username,
            who_read: [],
            create_date: new Date(),
            profile_pic_url: this.state.user.profile_pic_url,
            message_type: '3',
            object_url: uri,
            file_name: audioName,
            file_extension: "audio/wav"
        }

        const messageLists = _.get(this.state, 'chat', [])
        const chatData = [draftMessage].concat(messageLists)
        store.dispatch(chat(chatData))

        try {
            const resSendTheMessage = await sendFileMessage(this.state.chatInfo.chat_room_id, '3', {
                fileName: audioName,
                type: "audio/wav",
                uri: uri
            })
            if(_.get(resSendTheMessage, 'error') || !resSendTheMessage) {
                const indexLocal = chatData.findIndex((message) => {
                    return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
                })

                chatData[indexLocal].isError = true
                store.dispatch(chat(chatData))

                return
            }
            const chat_message_id = _.get(resSendTheMessage, 'new_chat_message.chat_message_id')
            // update message for everyone in group
            emit_message('', this.state.chatInfo.chat_room_id, this.state.user.user_id, chat_message_id, draft_message_id)

            // update our own
            emit_update_friend_chat_list(this.state.user.user_id, this.state.user.user_id)

            // update every friends in group
            const friend_user_ids = this.state.chatInfo.friend_user_ids.split(',')
            friend_user_ids.forEach((friend_user_id) => {
                emit_update_friend_chat_list(this.state.user.user_id, friend_user_id)
            })

            this.setState({
                message: '',
                roundRecording: 0
            })
        } catch(err) {
            const indexLocal = chatData.findIndex((message) => {
                return _.get(message, 'draft_message_id', 'unknown') == draft_message_id
            })

            chatData[indexLocal].isError = true
            store.dispatch(chat(chatData))

            return
        }
    }

  render() {
    return (
        <Container>
            <Header style={{ backgroundColor: '#3b5998' }}>
                <Left>
                    <Button transparent onPress={() => {
                        new Promise(() => {
                            store.dispatch(isShowSearchBar(false))
                        })
                        new Promise(() => {
                            store.dispatch(
                                inviteFriends({
                                    data: []
                                })
                            )
                        })
                        new Promise(() => {
                            emit_unsubscribe(this.state.chatInfo.chat_room_id)
                        })
                        this.props.navigation.dispatch(NavigationActions.back())
                    }}>
                        <Icon style={{ color: 'white' }} name="md-arrow-round-back" />
                    </Button>
                </Left>
                <Body>
                    <Title>{ this.props.navigation.state.params.display_name }</Title>
                </Body>
                <Right>
                    {
                        !this.state.isShowSearchBar && <Button transparent onPress={() => {
                            this.setState({
                                showOptionMessageModal: true
                            })
                        }}>
                            <Icon style={{ color: 'white' }} name="md-call" />
                        </Button>

                    }
                    {
                        !this.state.isShowSearchBar && <Button transparent onPress={() =>
                            this.setState({
                                isShowAdditionalHeader: !this.state.isShowAdditionalHeader,
                                isShowPhoto: false,
                                isShowRecord: false
                            })
                        }>
                            <Icon style={{ color: 'white' }} name="md-settings" />
                        </Button>
                    }
                    {
                        this.state.isShowSearchBar && <Button
                            transparent
                            style={{ paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0 }}
                            onPress={() => {
                                this.setState({
                                    filterMessage: ''
                                }, () => {
                                    store.dispatch(isShowSearchBar(false))
                                    store.dispatch(onFetchMessageLists(''))
                                })
                            }}
                        >
                            <Text style={{ color: 'white', paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0 }}>Cancle</Text>
                        </Button>
                    }
                </Right>
            </Header>
            {
                this.state.isShowSearchBar && <Header style={{ backgroundColor: '#3b5998' }} searchBar rounded>
                    <Item>
                        <Icon name="ios-search" />
                            <Input
                                onSubmitEditing={() => {
                                    store.dispatch(onFetchMessageLists(this.state.filterMessage))
                                }}
                                placeholder="Search"
                                onChangeText={(txt) => this.setState({
                                    filterMessage: txt
                                })}
                            />
                        <Icon name="ios-people" />
                    </Item>
                    <Button transparent>
                        <Text>Search</Text>
                    </Button>
                </Header>
            }
            {
                 this.state.showInviteModal && <ModalNative
                     onRequestClose={() => {
                         this.setState({ showInviteModal: false }, () => {
                             new Promise(() => {
                                 this.setState({
                                     selectedOptionMessageId: {},
                                     inviteFriends: [],
                                     inviteFriendSeachText: ''
                                 })
                             })
                         })
                     }}
                     onBackdropPress={() => {
                         this.setState({ showInviteModal: false }, () => {
                             new Promise(() => {
                                 this.setState({
                                     selectedOptionMessageId: {},
                                     inviteFriends: [],
                                     inviteFriendSeachText: ''
                                 })
                             })
                         })
                     }}
                     isVisible={true}
                 >
                     <Container style={{
                         backgroundColor: 'white',
                         borderRadius: 4,
                         borderColor: 'rgba(0, 0, 0, 0.1)',
                     }}>
                         <Header style={{ backgroundColor: '#3b5998' }}>
                             <Left>
                                 <Button transparent onPress={() => {
                                     this.setState({ showInviteModal: false }, () => {
                                         new Promise(() => {
                                             this.setState({
                                                 selectedOptionMessageId: {},
                                                 inviteFriends: [],
                                                 inviteFriendSeachText: ''
                                             })
                                         })
                                     })
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
                        <FlatList
                            getItemLayout={(data, index) => (
                                {length: 100, offset: 100 * index, index}
                            )}
                             data={this.state.inviteFriends}
                             onEndReached={() => {
                                 this.loadMoreInviteFriendLists()
                             }}
                             onEndReachedThreshold={0.1}
                             keyExtractor={(item) => {
                                 return item.friend_user_id
                             }}
                             extraData={this.state}
                             renderItem={({item}) => (
                                 <ListItem avatar onPress={() => {
                                     if(this.state.isOpenCase) {
                                        this.setState({
                                            showOptionMessageModal: true,
                                            chat_room_id: this.state.chatInfo.chat_room_id,
                                            selected_invite_friend_user_id: item.friend_user_id
                                        })
                                        new Promise(() => {
                                            store.dispatch(onEnterOptionMessage())
                                        })
                                     } else {
                                         if(item.invited) {
                                             store.dispatch(onRemoveFriendFromGroup(this.state.chatInfo.chat_room_id, item.friend_user_id, false))
                                         } else {
                                             store.dispatch(onInviteFriendToGroup(this.state.chatInfo.chat_room_id, item.friend_user_id))
                                         }

                                        if(this.state.chatInfo.chat_room_type == 'N') {
                                             this.setState({
                                                 showInviteModal: false
                                             })
                                         }
                                     }
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
                     </Container>
                 </ModalNative>
             }
             {
                  this.state.showMemberModal && <ModalNative
                      onRequestClose={() => this.setState({ showMemberModal: false })}
                      onBackdropPress={() => this.setState({ showMemberModal: false })}
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
                                      this.setState({ showMemberModal: false })
                                  }}>
                                      <Icon style={{ color: 'white' }} name="md-close" />
                                  </Button>
                              </Left>
                              <Body>
                                  <Title>Member</Title>
                              </Body>
                              <Right>

                              </Right>
                          </Header>
                          <View style={[styles.searchContainer, { borderRadius: 4 }]}>
                            <RkTextInput autoCapitalize='none'
                                         autoCorrect={false}
                                         onSubmitEditing={() => {
                                             store.dispatch(onFetchFriendInGroup(this.state.memberSeachText))
                                         }}
                                         onChangeText={(memberSeachText) => this.setState({
                                             memberSeachText
                                         })}
                                         label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                                         rkType='row'
                                         placeholder='Search'/>
                          </View>
                          <View style={{ marginBottom: 40 }}>
                              <List>
                                 <FlatList
                                      data={this.state.member}
                                      onEndReached={() => this.onLoadMoreMemberInGroup()}
                                      onEndReachedThreshold={0.4}
                                      renderItem={({item}) => (
                                          <ListItem avatar onPress={() => {
                                              store.dispatch(onRemoveFriendFromGroup(this.state.chatInfo.chat_room_id, item.friend_user_id, true))
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
                  {
                      this.state.selectedMessageType == '1' && <Button
                          block
                          light
                          onPress={() => {
                              Clipboard.setString(this.state.copiedText)
                              this.setState({ showPickerModal: false })
                          }}
                      >
                          <Text>COPY</Text>
                      </Button>
                  }
                  {
                      this.props.navigation.state.params.display_name.toLowerCase() != 'keep' && <Button block light onPress={() => {
                          this.setState({ showPickerModal: false })
                          new Promise(() => {
                              saveInKeep(this.state.selectedMessageId)
                          })
                      }}>
                          <Text>SAVE IN KEEP</Text>
                      </Button>
                  }
                  <Button block light>
                      <Text>DELETE</Text>
                  </Button>
                  <Button block light onPress={() => {
                      this.setState({ showPickerModal: false })
                      new Promise(() => {
                         store.dispatch(onForward(this.state.selectedMessageId))
                      })
                  }}>
                      <Text>FORWORD</Text>
                  </Button>
                  {
                      this.state.selectedMessageType == '1' && <Button block light onPress={() => {
                          Share.share({
                              message: this.state.copiedText
                          }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg))
                      }}>
                          <Text>SHARE</Text>
                      </Button>
                  }
                </View>
            </Modal>
            <Modal
                onRequestClose={() => this.setState({ showHandleError: false })}
                onBackdropPress={() => this.setState({ showHandleError: false })}
                isVisible={this.state.showHandleError}
            >
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                      <Button
                          block
                          light
                          onPress={() => {
                              this._resend()
                          }}
                      >
                          <Text>RESEND</Text>
                      </Button>
                      <Button
                          block
                          light
                          onPress={() => {
                              this._deleteErrorMessage()
                          }}
                      >
                          <Text>DELETE</Text>
                      </Button>
                </View>
            </Modal>
            <RkAvoidKeyboard style={styles.container} onResponderRelease={(event) => {
              Keyboard.dismiss()
            }}>
            {
                this.state.isShowAdditionalHeader&&<View style={[styles.additionHeader, { backgroundColor: 'white',  borderColor: '#d3d3d3', borderBottomWidth: 0.5 }]}>
                    <GridView
                        itemWidth={70}
                        items={this.state.optionLists}
                        renderItem={item => (
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <TouchableOpacity style={styles.plus} rkType='clear' onPress={item.event}>
                                    <Icon ios={item.icon} android={item.icon} style={{fontSize: 20, color: 'gray'}}/>
                                </TouchableOpacity>
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
                    store.dispatch(onLoadMoreMessageLists(this.state.filterMessage))
                }}
                onEndReachedThreshold={0.3}
                keyExtractor={(post) => {
                    return post.chat_message_id
                }}
                extraData={this.state}
                style={styles.list}
                data={this.state.chat}
                renderItem={this._renderItem.bind(this)}
            />
            {
                this.state.showOptionMessageModal &&
                <ModalNative
                   onRequestClose={() => this.setState({ showOptionMessageModal: false })}
                   onBackdropPress={() => this.setState({ showOptionMessageModal: false })}
                   isVisible={true}
               >
                       <Container>
                           <Header style={{ backgroundColor: '#3b5998' }}>
                               <Left>
                                   <Button transparent onPress={() => {
                                       this.setState({ showOptionMessageModal: false })
                                   }}>
                                       <Icon style={{ color: 'white' }} name="md-close" />
                                   </Button>
                               </Left>
                               <Body>
                                   <Title>Select Message</Title>
                               </Body>
                               <Right>
                                   <Button transparent onPress={() => {
                                        const selectedOptionMessageId = []
                                        _.forEach(this.state.selectedOptionMessageId, (value, key) => {
                                            if(value) {
                                                selectedOptionMessageId.push(key)
                                            }
                                        })
                                        store.dispatch(onInviteFriendToGroupWithOpenCase(this.state.chatInfo.chat_room_id, this.state.selected_invite_friend_user_id, selectedOptionMessageId))
                                   }}>
                                        <Icon style={{ color: 'white' }} name="md-checkmark" />
                                   </Button>
                               </Right>
                           </Header>
                            <FlatList ref='list'
                                getItemLayout={(data, index) => (
                                    {length: 100, offset: 100 * index, index}
                                )}
                                inverted={true}
                                onEndReached={() => {
                                    store.dispatch(onLoadMoreOptionMessage())
                                }}
                                onEndReachedThreshold={0.3}
                                keyExtractor={(post) => {
                                    return post.chat_message_id
                                }}
                                extraData={this.state}
                                style={styles.list}
                                data={this.state.optionMessage}
                                renderItem={this._renderItem.bind(this)}
                            />
                    </Container>
                </ModalNative>
            }
              <View style={styles.footer}>
                {
                    this.state.isShowMedie&&<TouchableOpacity style={styles.plus} rkType='clear' onPress={() => this.setState({ isShowMedie: false })}>
                      <Icon ios='md-camera' android="md-arrow-dropleft-circle" style={{fontSize: 20, color: 'gray'}}/>
                    </TouchableOpacity>
                }
                {
                    !this.state.isShowMedie&&<TouchableOpacity style={styles.plus} rkType='clear' onPress={() => this.setState({ isShowMedie: true })}>
                        <Icon ios='md-camera' android="md-arrow-dropright-circle" style={{fontSize: 20, color: 'gray'}}/>
                    </TouchableOpacity>
                }
                {
                    this.state.isShowMedie&&<TouchableOpacity style={styles.plus} rkType='clear' onPress={() => {
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
                                this._pushPhoto(response.data, response.uri)
                            }
                        })
                    }}>
                        <Icon ios='md-camera' android="md-camera" style={{fontSize: 20, color: 'gray'}}/>
                    </TouchableOpacity>
                }
                {
                    this.state.isShowMedie&&<TouchableOpacity style={styles.plus} rkType='clear' onPress={() => {
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
                                this._pushPhoto(response.data, response.uri)
                            }
                        })
                    }}>
                        <Icon ios='md-photos' android="md-photos" style={{fontSize: 20, color: 'gray'}}/>
                    </TouchableOpacity>
                }
                {
                    this.state.isShowMedie&&<TouchableOpacity style={styles.plus} rkType='clear' onPress={() => {
                        Keyboard.dismiss()
                        this.setState({
                            isShowRecord: !this.state.isShowRecord,
                            isShowPhoto: false,
                            isShowAdditionalHeader: false
                        })
                    }}>
                        <Icon ios='attachment' android="md-mic" style={{fontSize: 20, color: 'gray'}}/>
                    </TouchableOpacity>
                }
                {
                    this.state.isShowMedie&&<TouchableOpacity
                        style={styles.plus}
                        rkType='clear'
                        onPress={() => {
                             this._openFilePicker()
                        }}
                    >
                        <Icon ios='attachment' android="md-folder-open" style={{fontSize: 20, color: 'gray'}}/>
                    </TouchableOpacity>
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
                    <Item regular style={[styles.textInput, { marginLeft: 5, marginRight: 5, marginBottom: 5, backgroundColor: 'white', flex: 1 } ]}>
                        <Input
                            onFocus={() => {
                            this._scroll(true)
                            this.setState({ isShowMedie: false, isShowPhoto: false })
                        }}
                        onBlur={() => this._scroll(true)}
                        onChangeText={(message) => this.setState({message})}
                        value={this.state.message}
                        placeholder="Add a comment ..."/>
                    </Item>
                  <TouchableOpacity style={styles.plus} rkType='clear' onPress={() => {
                      Keyboard.dismiss()
                      this.setState({ isShowPhoto: !this.state.isShowPhoto, isShowRecord: false, isShowAdditionalHeader: false })
                  }}>
                        <Icon ios='attachment' android="md-happy" style={{fontSize: 20, color: 'gray'}}/>
                  </TouchableOpacity>
                <TouchableOpacity onPress={() => this._pushMessage(this.state.message)} style={{ backgroundColor: '#f64e59', width: 40, height: 40, borderRadius: 20, justifyContent: 'center',
    alignItems: 'center' }}>
                    <Image source={require('../../assets/icons/sendIcon.png')}/>
                </TouchableOpacity>
              </View>
              {
                  this.state.isShowPhoto&&<View style={{ height: 200 }}>
                        <GridView
                            itemWidth={70}
                            items={this.state.sticker[this.state.collectionKeySelected].sticker_lists}
                            renderItem={item => (
                                <View>
                                    <TouchableOpacity onPress={() => {
                                        this._pushSticker(item.path, item.url)
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

                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row' }}>
                            {
                                this.state.roundRecording >= 1 && this.state.recording == false  && <TouchableOpacity style={{ marginRight: 10, backgroundColor: '#edb730', width: 80, height: 80, borderRadius: 60, justifyContent: 'center', alignItems: 'center' }} onPress={() => {
                                    this.setState({
                                        currentTime: 0.0
                                    }, () => {
                                        this._record()
                                    })
                                }}>
                                 <Icon name='md-sync' style={{ color: 'white', fontSize: 35 }}/>
                                </TouchableOpacity>
                            }
                            {
                                this.state.roundRecording >= 1 && this.state.recording == false  && <TouchableOpacity style={{ marginLeft: 10, backgroundColor: '#ff6666', width: 80, height: 80, borderRadius: 60, justifyContent: 'center', alignItems: 'center' }} onPress={() => {
                                    this._pushAudio()
                                }}>
                                    <Text style={{ color: 'white' }}>Send</Text>
                                </TouchableOpacity>
                            }
                            {
                                (this.state.roundRecording == 0 || this.state.recording == true ) && <TouchableOpacity style={{ backgroundColor: '#ff6666', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' }} onPress={() => {
                                    if(this.state.recording) {
                                        this._stop()
                                    } else {
                                        this._record()
                                    }
                                }}>
                                    <Text style={{ color: 'white' }}>{ this.state.recording? 'Stop' : 'Record' }</Text>
                                    {
                                        this.state.recording && <Text style={{ color: 'white' }}>
                                            {
                                                Math.floor(this.state.currentTime)
                                            }
                                        </Text>
                                    }
                                </TouchableOpacity>
                            }

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
    maxWidth:'60%',
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
textInput: {
    height: 45,
    borderRadius: 10,
    paddingHorizontal: 19,
    paddingLeft: 10, paddingRight: 10
}
}))
