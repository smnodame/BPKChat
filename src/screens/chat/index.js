import React from 'react';
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  Keyboard
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
      data: conversation
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
      <RkText style={styles.time} rkType='secondary7 hintColor'>
        {moment().add(date, 'seconds').format('LT')}
      </RkText>);

    return (
      <View style={[styles.item, itemStyle]}>
        {!inMessage && renderDate(info.item.date)}
        <View style={[styles.balloon, {backgroundColor}]}>
          <RkText rkType='primary2 mediumLine chat'>{info.item.text}</RkText>
        </View>
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
                </Right>
            </Header>
            <RkAvoidKeyboard style={styles.container} onResponderRelease={(event) => {
              Keyboard.dismiss();
            }}>
              <FlatList ref='list'
                        extraData={this.state}
                        style={styles.list}
                        data={this.state.data.messages}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}/>
              <View style={styles.footer}>
                <RkButton style={styles.plus} rkType='clear'>
                  <RkText rkType='awesome secondaryColor'>{FontAwesome.plus}</RkText>
                </RkButton>

                <RkTextInput
                  onFocus={() => this._scroll(true)}
                  onBlur={() => this._scroll(true)}
                  onChangeText={(message) => this.setState({message})}
                  value={this.state.message}
                  rkType='row sticker'
                  placeholder="Add a comment..."/>

                <RkButton onPress={() => this._pushMessage()} style={styles.send} rkType='circle highlight'>
                    <Image source={require('../../assets/icons/sendIcon.png')}/>
                </RkButton>
              </View>
              <View style={{ height: 200 }}>
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
            </RkAvoidKeyboard>
        </Container>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  header: {
    alignItems: 'center'
  },
  avatar: {
    marginRight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.screen.base
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
