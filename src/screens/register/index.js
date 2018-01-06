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

export default class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			isReady: false,
			error: "",
			loading: false
        }
		this.openControlPanel = this.openControlPanel.bind(this)
		this.onLogin = this.onLogin.bind(this)
    }

	async componentDidMount() {

    }

	async componentWillMount() {

    }

	async onLogin() {

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
