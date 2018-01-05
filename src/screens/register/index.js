import React from 'react';
import { StyleSheet, Dimensions, Platform, Image, Picker, TextInput, TouchableOpacity, KeyboardAvoidingView, AsyncStorage, ActivityIndicator } from 'react-native';
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
import axios from "axios"
import { NavigationActions } from 'react-navigation'
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';

const deviceHeight = Dimensions.get("window").height
const deviceWidth = Dimensions.get("window").width

const datas = [
	{
		name: "Login",
		route: "Login",
		icon: "lock",
		bg: "#C5F442",
	}
];



export default class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shadowOffsetWidth: 1,
            shadowRadius: 4,
			isReady: false,
			page: 'Login',
			error: "",
			loading: false
        }
		this.openControlPanel = this.openControlPanel.bind(this)
		this.onLogin = this.onLogin.bind(this)
    }

	async componentDidMount() {

    }

	async componentWillMount() {
		let default_host = await AsyncStorage.getItem('default_host')

		const host = await AsyncStorage.getItem('default_host')
		if(host) {

		} else {
			default_host = await AsyncStorage.setItem('default_host', 'http://192.168.13.31/bpkservice')
		}
		this.setState({ isReady: true, default_host: default_host })

		// const token = await AsyncStorage.getItem('token')
		// if(token) {
        //
		// } else {
		// 	await AsyncStorage.setItem('current_state', 'Login')
		// }
    }

	openControlPanel = () => {
		this._drawer.open()
	}

	async onLogin() {
		if(this.state.username && this.state.password) {
			this.setState({
				loading: true
			})
			axios.get(this.state.default_host + '/api/user/login?username=' + this.state.username + '&password='+ this.state.password)
			.then((response) => {
				if(response.data.success == "1") {
					this.setState({ error: "" })
					this.setState({
						loading: false
					})
				} else {
					this.setState({ error: response.data.error, password: ""})
					this.setState({
						loading: false
					})
				}
			})
		} else {
			this.setState({ error: 'กรุณาระบุ Username เเละ Password' })
			this.setState({
				loading: false
			})
		}
	}

    render() {
    return (
		<Container>
			<Content contentContainerStyle={{ backgroundColor: '#f4f4f4', flexGrow: 1, justifyContent : 'center' }}>
				<KeyboardAvoidingView  behavior="padding" style={{ backgroundColor: '#f4f4f4', marginTop: 15, paddingLeft: 20, paddingRight: 20, marginBottom: 15, width: '100%' }}>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
            			<Input placeholderTextColor='#d4d8da' placeholder='ID'
							onChangeText={(firstname) => this.setState({firstname})}
							value={this.state.firstname}
						/>
            		</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
            			<Input placeholderTextColor='#d4d8da' placeholder='Password'
							secureTextEntry={true}
							onChangeText={(lastname) => this.setState({lastname})}
							value={this.state.lastname}
						/>
            		</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
						<Input placeholderTextColor='#d4d8da' placeholder='Confirm Password'
							secureTextEntry={true}
							onChangeText={(pid) => this.setState({pid})}
							value={this.state.pid}
						/>
					</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
						<Input placeholderTextColor='#d4d8da' placeholder='Display Name'
							onChangeText={(old_hv) => this.setState({old_hv})}
							value={this.state.old_hv}
						/>
					</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
						<Input placeholderTextColor='#d4d8da' placeholder='Mobile No'
							onChangeText={(old_hv) => this.setState({old_hv})}
							value={this.state.old_hv}
						/>
					</Item>
					<Picker
						style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10, borderWidth: 3, borderColor: 'black' } ]}
						selectedValue={this.state.language}
						onValueChange={(itemValue, itemIndex) => this.setState({language: itemValue})}>
						<Picker.Item label="ไทย" value="th" />
						<Picker.Item label="English" value="en" />
					</Picker>
				</KeyboardAvoidingView>
				<Button block style={{ marginRight: 20, marginLeft: 20, backgroundColor: '#8b9dc3' }}
					onPress={() =>  this.onLogin()}
				>
					{
						this.state.loading&&<ActivityIndicator size='large' />
					}
					<Text>Register</Text>
				</Button>
				{
					!!this.state.error&&<Text style={{ textAlign: 'center', color: 'white', marginTop: 10 }}>{ this.state.error }</Text>
				}
				<View style={{ justifyContent: 'center',flexDirection: 'row', marginTop: 15 }}>
				  <RkText rkType='primary3' style={{ color: 'black'}}>Already have an account?</RkText>
				  <RkButton rkType='clear'>
					<RkText rkType='header6' style={{ color: 'black'}} onPress={() => this.props.navigation.navigate('Login')}> Sign in
					  now </RkText>
				  </RkButton>
				</View>
			</Content>
		</Container>
    )
  }
}


const drawerStyles = {
     drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
     main: {paddingLeft: 3},
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sidebar: {
		flex: 1,
		backgroundColor: "#fff"
	},
	textInput: {
		height: 50,
		borderRadius: 3,
		borderWidth: 1,
		borderColor: '#d3d3d3',
		paddingHorizontal: 19,
		paddingLeft: 10, paddingRight: 10
	},
	drawerCover: {
		alignSelf: "stretch",
		// resizeMode: 'cover',
		height: deviceHeight / 3.5,
		width: null,
		position: "relative",
		marginBottom: 10,
		backgroundColor: '#004B85'
	},
	drawerImage: {
		position: "absolute",
		// left: (Platform.OS === 'android') ? 30 : 40,
		left: Platform.OS === "android" ? deviceWidth / 15 : deviceWidth / 12,
		// top: (Platform.OS === 'android') ? 45 : 55,
		top: Platform.OS === "android" ? deviceHeight / 13 : deviceHeight / 12,
		width: 250,
		height: 75,
		resizeMode: "cover"
	},
	listItemContainer: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center"
	},
	iconContainer: {
		width: 37,
		height: 37,
		borderRadius: 18,
		marginRight: 12,
		paddingTop: Platform.OS === "android" ? 7 : 5
	},
	sidebarIcon: {
		fontSize: 21,
		color: "#fff",
		lineHeight: Platform.OS === "android" ? 21 : 25,
		backgroundColor: "transparent",
		alignSelf: "center"
	},
	text: {
		fontWeight: Platform.OS === "ios" ? "500" : "400",
		fontSize: 16,
		marginLeft: 20
	},
	badgeText: {
		fontSize: Platform.OS === "ios" ? 13 : 11,
		fontWeight: "400",
		textAlign: "center",
		marginTop: Platform.OS === "android" ? -3 : undefined
	},
	button: {
		height: 60,
		borderRadius: 3,
		backgroundColor: '#11B8FF',
		justifyContent: "center",
		alignItems: "center"
	},
	loading: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center'
 	}
});
