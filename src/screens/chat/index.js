import React from 'react';
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleSheet
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
import {sendTheMessage} from '../../redux/api'
import { emit_update_friend_chat_list, emit_unsubscribe, emit_message } from '../../redux/socket.js'

import { NavigationActions } from 'react-navigation'
let moment = require('moment');


let getUserId = (navigation) => {
  return navigation.state.params ? navigation.state.params.userId : undefined;
};

export default class Chat extends React.Component {

    constructor(props) {
        super(props);

        // let conversation = data.getConversation(getUserId(this.props.navigation));
        let conversation = data.getConversation();

        this.state = {
            data: conversation,
            isShowAdditionalHeader: false
        };
        this._renderItem = this._renderItem.bind(this)
    }

    updateData = () => {
        const state = store.getState()
        this.setState({
            chat: _.get(state, 'chat.chat', []),
            chatInfo: _.get(state, 'chat.chatInfo'),
            user: _.get(state, 'user.user')
        })
    }

	async componentWillMount() {
        this.updateData()
		store.subscribe(() => {
            this.updateData()
		})
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.refs.list.scrollToEnd();
        });
    }

    _renderItem(info) {
        console.log('================')
        console.log(info)
        console.log(info.item.message_type)
        console.log(info.item.username)
        console.log(this.state.user.username)
        let inMessage = info.item.username != this.state.user.username;
        let backgroundColor = inMessage
            ? RkTheme.current.colors.chat.messageInBackground
                : RkTheme.current.colors.chat.messageOutBackground;
        let itemStyle = inMessage ? styles.itemIn : styles.itemOut;

        let renderDate = (date) => (
        <View>
            <RkText style={styles.time} rkType='secondary7 hintColor'>
                {moment(date).fromNow()}
            </RkText>
        </View>
    );

    return (
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
            info.item.message_type=='2' && <Image
                style={{ height: 120, width: 120 }}
                source={{uri: info.item.object_url }}
            />
        }
        {
            info.item.message_type=='4' && <Image
                style={{ height: 100, width: 100 }}
                source={{uri: info.item.object_url }}
            />
        }
        {
            info.item.message_type=='3' && <View />
        }
        {
            info.item.message_type=='5' && <View style={[styles.balloon, {backgroundColor}]}>
                <TouchableWithoutFeedback onLongPress={() => this.setState({showPickerModal: true})}>
                <View>
                    <RkText rkType='primary2 mediumLine chat' style={{ marginBottom: 8 }}>
                        {  `${info.item.file_name}`}
                    </RkText>
                    <RkText rkType='secondary4 hintColor'>
                        {  `file extension: ${info.item.file_extension}`}
                    </RkText>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        }
        {inMessage && renderDate(info.item.create_date)}
      </View>
    )
  }

    _scroll() {
        if (Platform.OS === 'ios') {
            this.refs.list.scrollToEnd();
        } else {
            _.delay(() => this.refs.list.scrollToEnd(), 100);
        }
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
                    <Title>{ this.state.chatInfo.display_name }</Title>
                </Body>
                <Right>
                    <Button transparent>
                        <Icon style={{ color: 'white' }} name="md-call" />
                    </Button>
                    <Button transparent onPress={() => this.setState({ isShowAdditionalHeader: !this.state.isShowAdditionalHeader })}>
                        <Icon style={{ color: 'white' }} name="md-settings" />
                    </Button>
                </Right>
            </Header>
            {
                this.state.showInviteModal && <Modal
                    onRequestClose={() => this.setState({ showInviteModal: false })}
                    onBackdropPress={() => this.setState({ showInviteModal: false })}
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
                this.state.isShowAdditionalHeader&&<View style={styles.additionHeader}>
                    <GridView
                        itemWidth={70}
                        items={[
                            {
                                icon: 'md-person-add',
                                name: 'Invite',
                                event: () => {
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
                                name: 'Search Text',
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
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear'>
                        <Icon ios='md-camera' android="md-camera" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear'>
                        <Icon ios='md-photos' android="md-photos" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear'>
                        <Icon ios='attachment' android="md-mic" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }
                {
                    this.state.isShowMedie&&<RkButton style={styles.plus} rkType='clear'>
                        <Icon ios='attachment' android="md-folder-open" style={{fontSize: 20, color: 'gray'}}/>
                    </RkButton>
                }


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
                  <RkButton style={styles.plus} rkType='clear' onPress={() => this.setState({ isShowPhoto: !this.state.isShowPhoto})}>
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
                            items={[
                                'http://cdn-th.tunwalai.net/files/member/2781675/1747465371-member.jpg',
                                'https://pbs.twimg.com/profile_images/637621688260128768/7Umrx0Dt_400x400.png',
                                'https://pbs.twimg.com/profile_images/378800000130832007/5a3f14d4f63adfc402c854ae025aeada_400x400.png',
                                'https://i.pinimg.com/236x/1e/6a/53/1e6a5385351b530f2f3ac337e1e86dd6--emoticon-facebook.jpg',

                                'http://www.stickersort.com/wp-content/uploads/2014/12/381Sortlist-Facebook-Stickers.png',
                                'http://123emoji.com/wp-content/uploads/2016/08/1943126362207548576.png',
                                'http://www.stickersort.com/wp-content/uploads/2014/12/378Sortlist-Facebook-Stickers.png',
                                'http://123emoji.com/wp-content/uploads/2016/08/1943126362080881922.png',

                                'https://i.pinimg.com/236x/d7/e2/01/d7e20133528e631bc1a51f9b6b4c931d--emoticon-emojis.jpg',
                                'https://www.google.co.th/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwicvKfDm7LYAhUEuI8KHWxVBuUQjBwIBA&url=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D422317134532796&psig=AOvVaw3R7xvS0nxP6itWM50HuYPj&ust=1514739663079103',
                                'https://pic.chinesefontdesign.com/uploads/2014/04/022.png',
                                'http://www.stickersort.com/wp-content/uploads/2014/12/388Sortlist-Facebook-Stickers.png'
                            ]}
                            renderItem={item => (
                                <View>
                                    <Image
                                        style={{ height: 70 }}
                                        source={{uri: item}}
                                    />
                                </View>
                            )}
                        />
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
