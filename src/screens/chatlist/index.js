import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
  RkButton
} from 'react-native-ui-kitten';
import { Thumbnail, Button, Text, Badge } from 'native-base';
import {Avatar} from '../../components';
import {FontAwesome} from '../../assets/icons';
let moment = require('moment');
import Modal from 'react-native-modal';
import { selectChat, onIsShowActionChat, onMuteChat, onHideChat, onBlockChat, onDeleteChat, onUnblockChat, onUnmuteChat  } from '../../redux/actions.js'
import {store} from '../../redux'
import { muteChat } from '../../redux/api.js'

export default class ChatList extends React.Component {
    static navigationOptions = {
        title: 'Chats List'.toUpperCase()
    };

    constructor(props) {
        super(props);
        this.renderHeader = this._renderHeader.bind(this);
        this.renderItem = this._renderItem.bind(this);
        this.state = {
            data: [],
            query: ''
        }
    }

    updateData = () => {
        const state = store.getState()
        this.setState({
            chatLists: _.get(state, 'chat.chatLists', []),
            chatListsClone: _.get(state, 'chat.chatLists', []),
            selectedChatRoomId: _.get(state, 'chat.selectedChatRoomId', ''),
            showPickerModal: _.get(state, 'chat.isShowActionChat', false)
        })
        this._filter(this.state.query)
    }

	async componentWillMount() {
        this.updateData()
		store.subscribe(() => {
            this.updateData()
		})
    }

    isBlocked = () => {
        const selectedChatRoom = this.state.chatLists.find((chat) => {
            return chat.chat_room_id == this.state.selectedChatRoomId
        })
        return _.get(selectedChatRoom, 'is_blocked', '0') == '1'
    }

    isMute = () => {
        const selectedChatRoom = this.state.chatLists.find((chat) => {
            return chat.chat_room_id == this.state.selectedChatRoomId
        })
        return _.get(selectedChatRoom, 'is_mute', '0') == '1'
    }

    _filter(text) {
        if(text) {
            let pattern = new RegExp(text, 'i')
            let chats = _.filter(this.state.chatLists, (chat) => {
                if (chat.display_name.search(pattern) != -1)
                    return chat
            })
            this.setState({chatListsClone: chats})
        }
    }

    _renderSeparator() {
        return (
            <View style={styles.separator}/>
        )
    }

    _renderHeader() {
        return (
            <View style={styles.searchContainer}>
                <RkTextInput autoCapitalize='none'
                    autoCorrect={false}
                    onChange={(event) => {
                        this.setState({
                            query: event.nativeEvent.text
                        })
                        this._filter(event.nativeEvent.text)
                    }}
                    label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                    rkType='row'
                    placeholder='Search'/>
            </View>
        )
    }

    _renderItem(data) {
        const info = data.item
        return (
            <TouchableWithoutFeedback onPress={() =>  store.dispatch(selectChat(info))} onLongPress={() =>  {
                this.setState({
                    selectedChatRoomId: info.chat_room_id
                })
                store.dispatch(onIsShowActionChat(true, info.chat_room_id))
            }}>
                <View style={styles.container}>
                    <Thumbnail source={{ uri: info.profile_pic_url }} />
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>
                            <RkText numberOfLines={1} style={{ width: '60%' }} rkType='header5'>{ info.display_name }</RkText>
                            <RkText rkType='secondary4 hintColor'>
                                {moment(info.last_chat).fromNow()}
                            </RkText>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <RkText style={{ width: '70%' }} numberOfLines={2} rkType='primary3 mediumLine'>{ info.last_message }</RkText>
                        </View>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

  render() {
    return (
    <View>
        <FlatList
          style={styles.root}
          data={this.state.chatListsClone}
          extraData={this.state}
          ListHeaderComponent={this.renderHeader}
          ItemSeparatorComponent={this._renderSeparator}
          renderItem={this.renderItem}/>
          <Modal
              onRequestClose={() => store.dispatch(onIsShowActionChat(false, ''))}
              onBackdropPress={() => store.dispatch(onIsShowActionChat(false, ''))}
              isVisible={this.state.showPickerModal}
          >
              <View style={{
                  backgroundColor: 'white',
                  borderRadius: 4,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
              }}>
                <Button block light onPress={() => {
                    store.dispatch(onHideChat())
                }}>
                    <Text>Hide</Text>
                </Button>
                {
                    !this.isMute()&&<Button block light onPress={() => {
                        store.dispatch(onMuteChat())
                    }}>
                        <Text>Mute</Text>
                    </Button>
                }
                {
                    this.isMute()&&<Button block light onPress={() => {
                        store.dispatch(onUnmuteChat())
                    }}>
                        <Text>UnMute</Text>
                    </Button>
                }
                {
                    this.isBlocked()&&<Button block light onPress={() => {
                        store.dispatch(onUnblockChat())
                    }}>
                        <Text>Unblock</Text>
                    </Button>
                }
                {
                    !this.isBlocked()&&<Button block light onPress={() => {
                        store.dispatch(onBlockChat())
                    }}>
                        <Text>Block</Text>
                    </Button>
                }
                <Button block light onPress={() => {
                    store.dispatch(onDeleteChat())
                }}>
                    <Text>Delete</Text>
                </Button>
              </View>
          </Modal>
    </View>
    )
  }
}

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
    paddingLeft: 19,
    paddingRight: 16,
    paddingVertical: 12,
    flexDirection: 'row'
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base
  }
}));
