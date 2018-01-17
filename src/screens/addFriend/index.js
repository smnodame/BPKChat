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
    Badge,
    Item,
    Input
} from 'native-base'
import { NavigationActions } from 'react-navigation'

import { searchNewFriend } from '../../redux/actions.js'
import {store} from '../../redux'


export default class AddFriend extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      data: [],
      showProfileModal: false
    }
  }

  componentDidMount() {

  }

  _submit = () => {
      store.dispatch(searchNewFriend(this.state.user))
      this.setState({ showProfileModal: true })
  }

  render() {
    return (
        <Container>
            <Header searchBar rounded>
                <Left>
                <Button transparent onPress={() => this.props.navigation.dispatch(NavigationActions.back())}>
                    <Icon style={{ color: 'white' }} name="md-arrow-round-back" />
                </Button>
                </Left>
                <Body>
                    <Title>ADD FRIEND</Title>
                </Body>
            </Header>
            <Header searchBar rounded>
                <Item>
                    <Icon style={{ color: 'white' }} name="ios-search" />
                    <Input
                        onSubmitEditing={() => this._submit()}
                        onChangeText={(user) => this.setState({user})}
                        placeholder="Search" />
                    <Icon style={{ color: 'white' }} name="ios-people" />
                </Item>
                <Button transparent>
                    <Text>Search</Text>
                </Button>
            </Header>
            <Content>
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
                        borderRadius: 6,
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
                                justifyContent: 'center', alignItems: 'flex-end', padding: 15,
                                borderRadius: 6,
                            }}
                        >
                            <Button block success>
                                <Text>ADD FRIEND</Text>
                            </Button>
                        </View>
                    </View>
                </Modal>
            </Content>
        </Container>
    )
  }
}
