import React from 'react';
import { StyleSheet, Dimensions, Platform, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, AsyncStorage, ActivityIndicator } from 'react-native';
import {
	Content,
	Text,
	List,
	ListItem,
	Icon,
	Container,
	Left,
	Right,
	Badge,
	Button,
	View,
	StyleProvider,
	getTheme,
	variables,
    Header,
	Item,
	Input,
	Body,
	Title,
	Tab,
	Tabs,
	TabHeading,
	Keyboard
} from "native-base";
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten'
import { NavigationActions } from 'react-navigation'

import { signin, start_app, navigate  } from '../../redux/actions.js'
import {store} from '../../redux'

import {NotificationsAndroid} from 'react-native-notifications';
console.log('---- run ----')
console.log(NotificationsAndroid)
// On Android, we allow for only one (global) listener per each event type.
NotificationsAndroid.setRegistrationTokenUpdateListener((deviceToken) => {
	// TODO: Send the token to my server so it could send back push notifications...
	console.log('Push-notifications registered!', deviceToken)
});

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			isReady: false,
			error: "",
			loading: false,
			username: "",
			password: ""
        }
		this.openControlPanel = this.openControlPanel.bind(this)
		this.onLogin = this.onLogin.bind(this)
    }

	async componentDidMount() {
    }

	async componentWillMount() {
        this.unsubscribe = store.subscribe(() => {
            const state = store.getState()
			this.setState({
				error: state.user.error
			})
        })
    }

	componentWillUnmount() {
        this.unsubscribe()
    }

	openControlPanel = () => {
		this._drawer.open()
	}

	async onLogin() {
		store.dispatch(signin(this.state.username, this.state.password))
	}

    render() {
    return (
		<Container style={{ backgroundColor: '#3b5998' }}>
            <Header style={{ backgroundColor: '#3b5998' }}>
            	<Left>
            	</Left>
            	<Body>
            		<Title>Authentication</Title>
            	</Body>
            </Header>
            <View style={styles.container} behavior="padding">
            		<Item regular style={[styles.textInput, { marginLeft: 15, marginRight: 15, marginBottom: 10, backgroundColor: 'white' } ]}>
            			<Icon active name='ios-contact' style={{ color: '#d4d8da' }} />
            			<Input
							placeholderTextColor='#d4d8da'
							placeholder='Username'
							onChangeText={(username) => this.setState({username})}
							value={this.state.username}
						/>
            		</Item>
            		<Item regular style={[styles.textInput, { marginLeft: 15, marginRight: 15, backgroundColor: 'white' } ]}>
            			<Icon active name='lock' style={{ color: '#d4d8da' }} />
            			<Input placeholderTextColor='#d4d8da'
							secureTextEntry={true}
							placeholder='Password'
							onChangeText={(password) => this.setState({password})}
							value={this.state.password}
						/>
            		</Item>
            		<Button block style={{ marginRight: 15, marginLeft: 15, marginTop: 15, backgroundColor: '#8b9dc3' }}
						onPress={() =>  this.onLogin()}
					>
						{
							this.state.loading&&<ActivityIndicator size='large' />
						}
            			<Text>Log In</Text>
            		</Button>
					{
						!!this.state.error&&<Text style={{ textAlign: 'center', color: 'white', marginTop: 10 }}>{ this.state.error }</Text>
					}
					<View style={{ justifyContent: 'center',flexDirection: 'row', marginTop: 15 }}>
		              <RkText rkType='primary3' style={{ color: 'white'}}>Don’t have an account?</RkText>
		              <RkButton rkType='clear'>
		                <RkText rkType='header6' style={{ color: 'white'}} onPress={() => this.props.navigation.navigate('SignUp')}> Sign up
		                  now </RkText>
		              </RkButton>
		            </View>
            </View>

		</Container>
    )
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#3b5998',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textInput: {
		height: 50,
		borderRadius: 3,
		borderWidth: 0.5,
		borderColor: '#d3d3d3',
		paddingHorizontal: 19,
		paddingLeft: 10, paddingRight: 10
	}
});
