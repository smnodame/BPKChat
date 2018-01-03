import React from 'react';
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  Keyboard,
  ScrollView
} from 'react-native';
import {InteractionManager} from 'react-native';
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

import { NavigationActions } from 'react-navigation'
let moment = require('moment');


let getUserId = (navigation) => {
  return navigation.state.params ? navigation.state.params.userId : undefined;
};

// <Avatar style={styles.avatar} rkType='small' img={user.photo}/>
export default class Chat extends React.Component {

  // static navigationOptions = ({navigation}) => {
  //   let renderAvatar = (user) => {
  //     return (
  //       <View/>
  //     );
  //   };
  //
  //   let renderTitle = (user) => {
  //     return (
  //       <TouchableOpacity onPress={() => navigation.navigate('ProfileV1', {id: user.id})}>
  //         <View style={styles.header}>
  //           <RkText rkType='header5'>{`${user.firstName} ${user.lastName}`}</RkText>
  //           <RkText rkType='secondary3 secondaryColor'>Online</RkText>
  //         </View>
  //       </TouchableOpacity>
  //     )
  //   };
  //
  //
  //   let user = data.getUser(getUserId(navigation));
  //   let rightButton = renderAvatar(user);
  //   let title = renderTitle(user);
  //   return (
  //     {
  //       headerTitle: title,
  //       headerRight: rightButton
  //     });
  // };

  constructor(props) {
    super(props);
    // let conversation = data.getConversation(getUserId(this.props.navigation));
    let conversation = data.getConversation();

    this.state = {
      data: conversation,
      isShowAdditionalHeader: false
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.refs.list.scrollToEnd();
    });
  }

  _keyExtractor(post, index) {
    return post.id;
  }

  _renderItem(info) {
    let inMessage = info.item.type === 'in';
    let backgroundColor = inMessage
      ? RkTheme.current.colors.chat.messageInBackground
      : RkTheme.current.colors.chat.messageOutBackground;
    let itemStyle = inMessage ? styles.itemIn : styles.itemOut;

    let renderDate = (date) => (
        <View>
        <RkText style={styles.time} rkType='secondary7 hintColor'>
          {moment().add(date, 'seconds').format('LT')}
        </RkText>
        </View>
      );

    return (
      <View style={[styles.item, itemStyle]}>
        {!inMessage && renderDate(info.item.date)}
        {
            info.item.format=='text' && <View style={[styles.balloon, {backgroundColor}]}>
              <RkText rkType='primary2 mediumLine chat'>{info.item.text}</RkText>
            </View>
        }
        {
            info.item.format=='image' && <Image
                style={{ height: 120, width: 120 }}
                source={{uri: info.item.url }}
            />
        }
        {
            info.item.format=='sticker' && <Image
                style={{ height: 100, width: 100 }}
                source={{uri: info.item.url }}
            />
        }

        {inMessage && renderDate(info.item.date)}
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

  _pushMessage() {
    if (!this.state.message)
      return;
    let msg = {
      id: this.state.data.messages.length,
      time: 0,
      type: 'out',
      text: this.state.message
    };


    let data = this.state.data;
    realm.write(() => {
      data.messages.push(msg);
    });

    this.setState({
      data,
      message: ''
    });
    this._scroll(true);
  }

  render() {
    return (
        <Container>
            <Header style={{ backgroundColor: '#3b5998' }}>
                <Left>
                    <Button transparent onPress={() => this.props.navigation.dispatch(NavigationActions.back())}>
                        <Icon name="md-arrow-round-back" />
                    </Button>
                </Left>
                <Body>
                    <Title>SMNODAME</Title>
                </Body>
                <Right>
                    <Button transparent>
                        <Icon name="md-call" />
                    </Button>
                    <Button transparent onPress={() => this.setState({ isShowAdditionalHeader: !this.state.isShowAdditionalHeader })}>
                        <Icon name="md-settings" />
                    </Button>
                </Right>
            </Header>
            <Modal
                onRequestClose={() => this.setState({ showProfileModal: false })}
                onBackdropPress={() => this.setState({ showProfileModal: false })}
                isVisible={true}
            >
                <View style={{
                    height: 400,
                    backgroundColor: 'white',
                    // justifyContent: 'center',
                    // alignItems: 'center',
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
                                name: 'Invite'
                            },
                            {
                                icon: 'md-remove-circle',
                                name: 'Remove Invite'
                            },
                            {
                                icon: 'md-mail-open',
                                name: 'Open Case'
                            },
                            {
                                icon: 'md-settings',
                                name: 'Setting'
                            },
                            {
                                icon: 'md-log-out',
                                name: 'Exit Group'
                            }
                        ]}
                        renderItem={item => (
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <RkButton style={styles.plus} rkType='clear'>
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
                        data={this.state.data.messages}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}/>
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
    paddingHorizontal: 10,
    marginRight: 7
  },
  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
  }
}));
