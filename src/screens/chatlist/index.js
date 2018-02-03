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
import { Thumbnail, Button, Text } from 'native-base';
import {Avatar} from '../../components';
import {FontAwesome} from '../../assets/icons';
import {data} from '../../data';
let moment = require('moment');
import Modal from 'react-native-modal';

import { selectChat, onIsShowActionChat, onMuteChat, onHideChat  } from '../../redux/actions.js'
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
            data: []
        }
    }

    updateData = () => {
        const state = store.getState()
        this.setState({
            chatLists: _.get(state, 'chat.chatLists', []),
            showPickerModal: _.get(state, 'chat.isShowActionChat', false),
            selectedChatRoomId: _.get(state, 'chat.selectedChatRoomId', '')
        })
    }

	async componentWillMount() {
        this.updateData()
		store.subscribe(() => {
            this.updateData()
		})
    }

    _filter(text) {
        let pattern = new RegExp(text, 'i');
        let chats = _.filter(this.chats, (chat) => {

            if (chat.withUser.firstName.search(pattern) != -1
            || chat.withUser.lastName.search(pattern) != -1)
                return chat;
        });

        this.setState({data: chats});
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
                    onChange={(event) => this._filter(event.nativeEvent.text)}
                    label={<RkText rkType='awesome'>{FontAwesome.search}</RkText>}
                    rkType='row'
                    placeholder='Search'/>
            </View>
        )
    }

    _renderItem(data) {
        const info = data.item
        return (
            <TouchableWithoutFeedback onPress={() =>  store.dispatch(selectChat(info))} onLongPress={() =>  store.dispatch(onIsShowActionChat(true, info.chat_room_id))}>
                <View style={styles.container}>
                    <Thumbnail source={{ uri: info.profile_pic_url }} />
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>
                            <RkText rkType='header5'>{ info.display_name }</RkText>
                            <RkText rkType='secondary4 hintColor'>
                                {moment(info.last_chat).fromNow()}
                            </RkText>
                        </View>
                        <RkText numberOfLines={2} rkType='primary3 mediumLine'>{ info.last_message }</RkText>
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
          data={this.state.chatLists}
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
                <Button block light onPress={() => {
                    store.dispatch(onMuteChat())
                }}>
                    <Text>Mute</Text>
                </Button>
                <Button block light onPress={() => {

                }}>
                    <Text>Block Chat</Text>
                </Button>
                <Button block light onPress={() => {

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
