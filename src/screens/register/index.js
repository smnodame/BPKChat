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
import {store} from '../../redux'
import { signup } from '../../redux/actions.js'

export default class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			isReady: false,
			error: "",
			loading: false,
			languages: [],
			language_id: 1
        }
		this.onSignup = this.onSignup.bind(this)

    }

	async componentDidMount() {

    }

	updateState = () => {
		const state = store.getState()
		console.log(state)
		this.setState({
			languages: state.system.languages
		})
	}

	async componentWillMount() {
		this.updateState()
		store.subscribe(() => {
			this.updateState()
		})
    }

	async onSignup() {
		store.dispatch(
			signup(
				this.state.id,
				this.state.password,
				this.state.confirm_password,
				this.state.display_name,
				this.state.mobile_no,
				this.state.language_id
			)
		)
	}

    render() {
    return (
		<Container>
			<Content contentContainerStyle={{ backgroundColor: '#f4f4f4', flexGrow: 1, justifyContent : 'center' }}>
				<KeyboardAvoidingView  behavior="padding" style={{ backgroundColor: '#f4f4f4', marginTop: 15, paddingLeft: 20, paddingRight: 20, marginBottom: 15, width: '100%' }}>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
            			<Input placeholderTextColor='#d4d8da' placeholder='ID'
							onChangeText={(id) => this.setState({id})}
							value={this.state.id}
						/>
            		</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
            			<Input placeholderTextColor='#d4d8da' placeholder='Password'
							secureTextEntry={true}
							onChangeText={(password) => this.setState({password})}
							value={this.state.password}
						/>
            		</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
						<Input placeholderTextColor='#d4d8da' placeholder='Confirm Password'
							secureTextEntry={true}
							onChangeText={(confirm_password) => this.setState({confirm_password})}
							value={this.state.confirm_password}
						/>
					</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
						<Input placeholderTextColor='#d4d8da' placeholder='Display Name'
							onChangeText={(display_name) => this.setState({display_name})}
							value={this.state.display_name}
						/>
					</Item>
					<Item regular style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10 } ]}>
						<Input placeholderTextColor='#d4d8da' placeholder='Mobile No'
							onChangeText={(mobile_no) => this.setState({mobile_no})}
							value={this.state.mobile_no}
						/>
					</Item>
					<Picker
						style={[styles.textInput, { backgroundColor: 'white', marginBottom: 10, borderWidth: 3, borderColor: 'black' } ]}
						selectedValue={this.state.language_id}
						onValueChange={(itemValue, itemIndex) => {
							this.setState({language_id: itemValue})
						}}>

						{
							this.state.languages.map((language) => {
								return (
									<Picker.Item key={language.user_language_id} label={language.detail} value={language.user_language_id} />
								)
							})
						}
					</Picker>
				</KeyboardAvoidingView>
				<Button block style={{ marginRight: 20, marginLeft: 20, backgroundColor: '#8b9dc3' }}
					onPress={() =>  this.onSignup()}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textInput: {
		height: 50,
		borderRadius: 3,
		borderWidth: 1,
		borderColor: '#d3d3d3',
		paddingHorizontal: 19,
		paddingLeft: 10, paddingRight: 10
	}
});
