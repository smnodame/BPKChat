import React from 'react'
import {
  ListView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native'
import _ from 'lodash'
import {
  RkStyleSheet,
  RkText,
  RkTextInput
} from 'react-native-ui-kitten'
import Modal from 'react-native-modal'
import { Thumbnail, Icon, Text, Button } from 'native-base'
import {data} from '../../data'
import {Avatar} from '../../components/avatar'
import {FontAwesome} from '../../assets/icons'
import { NavigationActions } from 'react-navigation'

import { enterContacts, removeFavorite, addFavorite, showOrHideFriendLists, onLoadMore, onSearchFriend } from '../../redux/actions.js'
import {store} from '../../redux'

export default class Contacts extends React.Component {
    static navigationOptions = {
        title: 'Contacts'.toUpperCase()
    }

    constructor(props) {
        super(props)

        this.state = {
            showProfileModal: false,
            showFriendModal: false,
            friends: {
                favorite: [],
                other: [],
                group: [],
                department: []
            },
            showFavoriteFriendLists: false,
            showGroupFriendLists: false,
            showOtherFriendLists: false,
            showDepartmentFriendLists: false,
            showProfileFriendLists: false,
            selectedFriend: {
                is_favorite: 'F'
            },
            numberOfFriendLists: {
                favorite: 0,
                other: 0,
                group: 0,
                department: 0
            }
        }

        this.renderHeader = this._renderHeader.bind(this)
    }

    saveGroupSetting = (selectedFriend) => {
        this.setState({
            selectedFriend: selectedFriend
        })
    }

    updateData = () => {
        const state = store.getState()
        console.log(state)
        this.setState({
            friends: _.get(state, 'friend.friends', {
                favorite: [],
                other: [],
                group: [],
                department: []
            }),
            showFavoriteFriendLists: _.get(state, 'system.isShowFriendLists.favorite', false),
            showGroupFriendLists: _.get(state, 'system.isShowFriendLists.group', false),
            showDepartmentFriendLists: _.get(state, 'system.isShowFriendLists.department', false),
            showOtherFriendLists: _.get(state, 'system.isShowFriendLists.other', false),
            user: _.get(state, 'user.user', {}),
            numberOfFriendLists: {
                favorite: _.get(state, 'friend.numberOfFriendLists.favorite', 0),
                other: _.get(state, 'friend.numberOfFriendLists.other', 0),
                group: _.get(state, 'friend.numberOfFriendLists.group', 0),
                department: _.get(state, 'friend.numberOfFriendLists.department', 0),
            }
        })
    }

	async componentWillMount() {
        this.updateData()
		store.subscribe(() => {
            this.updateData()
		})
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

    _removeFavorite = () => {
        store.dispatch(removeFavorite(this.state.user.user_id, this.state.selectedFriend.friend_user_id))
    }

    _addFavorite = () => {
        store.dispatch(addFavorite(this.state.user.user_id, this.state.selectedFriend.friend_user_id, this.state.selectedFriend))
    }

    loadmore = (group) => {
        store.dispatch(onLoadMore(group))
    }

    _showOrHideFriendLists = (type) => {
        let favorite = this.state.showFavoriteFriendLists
        let group = this.state.showGroupFriendLists
        let department = this.state.showDepartmentFriendLists
        let other = this.state.showOtherFriendLists
        if(type=='favorite') {
            favorite = !favorite
        } else if(type=='group') {
            group = !group
        } else if(type=='department') {
            department = !department
        } else if(type=='other') {
            other = !other
        }
        store.dispatch(
            showOrHideFriendLists({
                favorite,
                group,
                department,
                other,
            })
        )
    }

    goToGroupSetting = async () => {
        this.setState({ showGroupModal: false })
        this.props.screenProps.rootNavigation.navigate('GroupSetting', {
            selectedFriend: this.state.selectedFriend,
            saveGroupSetting: this.saveGroupSetting
        })
    }

    renderGroups = () => {
        return this.state.friends.group.filter((friend) => {
            return true
        }).map((friend) => {
            return (
                <TouchableOpacity key={friend.friend_user_id} onPress={() => this.setState({ selectedFriend: friend, showGroupModal: true })}>
                  <View style={styles.container}>
                      <Thumbnail  style={styles.avatar}  source={{ uri: friend.profile_pic_url }} />
                      <View style={{ flexDirection: 'column' }}>
                          <RkText rkType='header5'>{ friend.display_name }</RkText>
                          <RkText rkType='secondary4 hintColor'>{ friend.status_quote }</RkText>
                      </View>
                  </View>
                </TouchableOpacity>
            )
        })
    }

    renderFavorite = () => {
        return this.state.friends.favorite.filter((friend) => {
            return true
        }).map((friend) => {
            return (
                <View>
                    <TouchableOpacity key={friend.friend_user_id} onPress={() => this.setState({ selectedFriend: friend, showFriendModal: true })}>
                      <View style={styles.container}>
                          <Thumbnail  style={styles.avatar}  source={{ uri: friend.profile_pic_url }} />
                          <View style={{ flexDirection: 'column' }}>
                              <RkText rkType='header5'>{ friend.display_name }</RkText>
                              <RkText rkType='secondary4 hintColor'>{ friend.status_quote }</RkText>
                          </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.separator}/>
                </View>
            )
        })
    }

    renderOthers = () => {
        return this.state.friends.other.filter((friend) => {
            return true
        }).map((friend) => {
            return (
                <View>
                    <TouchableOpacity key={friend.friend_user_id} onPress={() => this.setState({ selectedFriend: friend, showFriendModal: true })}>
                        <View style={styles.container}>
                            <Thumbnail  style={styles.avatar}  source={{ uri: friend.profile_pic_url }} />
                            <View style={{ flexDirection: 'column' }}>
                                <RkText rkType='header5'>{ friend.display_name }</RkText>
                                <RkText rkType='secondary4 hintColor'>{ friend.status_quote }</RkText>
                            </View>
                        </View>
                        </TouchableOpacity>
                    <View style={styles.separator}/>
                </View>

            )
        })
    }

    renderDepartment = () => {
        return this.state.friends.department.filter((friend) => {
            return true
        }).map((friend, key) => {
            return (
                <View>
                    <TouchableOpacity key={key} onPress={() => this.setState({ selectedFriend: friend, showFriendModal: true })}>
                        <View style={styles.container}>
                            <Thumbnail  style={styles.avatar}  source={{ uri: friend.profile_pic_url }} />
                            <View style={{ flexDirection: 'column' }}>
                                <RkText rkType='header5'>{ friend.display_name }</RkText>
                                <RkText rkType='secondary4 hintColor'>{ friend.status_quote }</RkText>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.separator}/>
                </View>

            )
        })
    }

    isInFavorite = () => {
        const obj = this.state.friends.favorite.find((friend) => {
            return friend.friend_user_id == this.state.selectedFriend.friend_user_id
        })
        return !!obj
    }

    renderFavoriteModal = () => {
        return (
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
                            source={{uri: this.state.user.wall_pic_url}}
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
                            source={{uri: this.state.user.profile_pic_url}}
                        />
                    </View>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text>{ this.state.user.display_name }</Text>
                        <Text note>{ `ID ${this.state.user.username}` }</Text>
                    </View>
                    <View style={{ flex: 1}}>
                    </View>
                    <View
                        style={{
                            borderWidth: 1, borderColor: '#fdfdfd', flexDirection: 'row',
                            justifyContent: 'center', alignItems: 'flex-end', padding: 15
                        }}
                    >
                        <Button
                            transparent
                            style={{ flexDirection: 'column' }}
                            onPress={() => {
                                this.setState({
                                    showProfileModal: false
                                })
                                this.props.onTabClick("Profile")
                            }}
                        >
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
        )
    }

    renderFriendModal = () => {
        return (
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
                        source={{uri: this.state.selectedFriend.wall_pic_url}}
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
                        source={{uri: this.state.selectedFriend.profile_pic_url}}
                    />
                </View>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text>{ this.state.selectedFriend.display_name }</Text>
                    <Text note>{ `ID ${this.state.selectedFriend.friend_username}` }</Text>
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

                            {
                                !this.isInFavorite() &&
                                <Button
                                    transparent
                                    style={{ flexDirection: 'column', marginLeft: 10 }}
                                    onPress={() => {
                                        const selectedFriend = this.state.selectedFriend
                                        selectedFriend.is_favorite = 'T'
                                        this.setState({
                                            selectedFriend
                                        })
                                        this._addFavorite()
                                    }}
                                >
                                    <Icon name='md-heart-outline' style={{ color: 'gray' }} />
                                    <Text style={{ color: 'gray' }}>FAVORITES</Text>
                                </Button>
                            }
                            {
                                this.isInFavorite() &&
                                <Button
                                    transparent
                                    style={{ flexDirection: 'column', marginLeft: 10 }}
                                    onPress={() => {
                                        const selectedFriend = this.state.selectedFriend
                                        selectedFriend.is_favorite = 'F'
                                        this.setState({
                                            selectedFriend
                                        })
                                        this._removeFavorite()
                                    }}
                                >
                                    <Icon name='md-heart' style={{ color: 'gray' }} />
                                    <Text style={{ color: 'gray' }}>FAVORITES</Text>
                                </Button>
                            }
                    </View>
                </View>
            </Modal>
        )
    }

    renderGroupModal = () => {
        return (
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
                            source={{uri: this.state.selectedFriend.wall_pic_url}}
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
                            source={{uri: this.state.selectedFriend.profile_pic_url}}
                        />
                    </View>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text>{ this.state.selectedFriend.display_name }</Text>
                        {
                            this.state.selectedFriend.chat_room_type == 'C' &&
                            <View style={{ marginTop: 15 }}>
                                <Text note>{`Patient Name : ${this.state.selectedFriend.c_patient_name || '-'}`}</Text>
                                <Text note>{`HN : ${this.state.selectedFriend.c_hn || '-'}`}</Text>
                                <Text note>{`Description : ${this.state.selectedFriend.c_description || '-'}`}</Text>
                            </View>
                        }

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
                        <Button
                            transparent
                            style={{ flexDirection: 'column', marginLeft: 10 }}
                            onPress={() => {
                                this.goToGroupSetting()
                            }}
                        >
                            <Icon name='md-settings' style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray' }}>EDIT GROUP</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        )
    }
  render() {
    return (
        <View>
            {
                this.renderFavoriteModal()
            }
            {
                this.renderFriendModal()
            }
            {
                this.renderGroupModal()
            }
            <View style={styles.searchContainer}>
              <RkTextInput
                    onSubmitEditing={() =>
                        store.dispatch(onSearchFriend(this.state.filter))
                    }
                    onChangeText={(filter) => this.setState({
                        filter: filter
                    })}
                    autoCapitalize='none'
                    autoCorrect={false}
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
                      <Thumbnail  style={styles.avatar}  source={{ uri: this.state.user.profile_pic_url }} />
                      <RkText rkType='header5'>{ this.state.user.display_name }</RkText>
                  </View>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={{
                    paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                    backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                    borderBottomWidth: 0.5, flexDirection: 'row'
                }}
                onPress={() => this._showOrHideFriendLists('favorite')}
            >
                <RkText rkType='header6 hintColor'>{`Favorites (${this.state.friends.favorite.length})`}</RkText>
                <View style={{ flex: 1 }} />
            </TouchableOpacity>
            <View style={{ backgroundColor: 'white' }}>
                {
                    !!this.state.showFavoriteFriendLists&&this.renderFavorite()
                }
            </View>
            <TouchableOpacity
                style={{
                    paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                    backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                    borderBottomWidth: 0.5
                }}
                onPress={() => this._showOrHideFriendLists('group')}
            >
                <RkText rkType='header6 hintColor'>{`Groups (${this.state.numberOfFriendLists.group})`}</RkText>
            </TouchableOpacity>
            <View style={{ backgroundColor: 'white' }}>
                {
                    !!this.state.showGroupFriendLists&&<View>
                        {
                            this.renderGroups()
                        }
                        {
                            this.state.numberOfFriendLists.group > this.state.friends.group.length &&
                            <View>
                                <Button block light style={{ backgroundColor: 'white' }} onPress={() => this.loadmore('group')}>
                                    <Text>Load More</Text>
                                </Button>
                            </View>
                        }
                    </View>
                }
            </View>
            <TouchableOpacity
                style={{
                    paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                    backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                    borderBottomWidth: 0.5
                }}
                onPress={() => this._showOrHideFriendLists('department')}
            >
                <RkText rkType='header6 hintColor'>{`Departments (${this.state.numberOfFriendLists.department})`}</RkText>
            </TouchableOpacity>
            <View style={{ backgroundColor: 'white' }}>
                {
                    !!this.state.showDepartmentFriendLists&&<View>
                        {
                            this.renderDepartment()
                        }
                        {
                            this.state.numberOfFriendLists.department > this.state.friends.group.department &&
                            <View>
                                <Button block light style={{ backgroundColor: 'white' }} onPress={() => this.loadmore('department')}>
                                    <Text>Load More</Text>
                                </Button>
                            </View>
                        }
                    </View>
                }
            </View>
            <View>
                <TouchableOpacity
                    style={{
                        paddingTop: 10, paddingBottom: 10, paddingLeft: 15,
                        backgroundColor: '#fafafa', borderBottomColor: '#eaeaea',
                        borderBottomWidth: 0.5
                    }}
                    onPress={() => this._showOrHideFriendLists('other')}
                >
                    <RkText rkType='header6 hintColor'>{`Others (${this.state.numberOfFriendLists.other})`}</RkText>
                </TouchableOpacity>
                <View style={{ backgroundColor: 'white' }}>
                    {
                        !!this.state.showOtherFriendLists&&<View>
                            {
                                this.renderOthers()
                            }
                            {
                                this.state.numberOfFriendLists.other > this.state.friends.other.length &&
                                <View>
                                    <Button block light style={{ backgroundColor: 'white' }} onPress={() => this.loadmore('other')}>
                                        <Text>Load More</Text>
                                    </Button>
                                </View>
                            }
                        </View>
                    }

                </View>
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
