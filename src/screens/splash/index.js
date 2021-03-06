import React from 'react';
import { StyleSheet, Image, View, AsyncStorage } from 'react-native'
import { NavigationActions } from 'react-navigation'
import ShareMenu from 'react-native-share-menu'
import { setNavigator } from '../../services/NavigationService.js'

import { signin, start_app, navigate, enterSplash, onRecieveShareMessage  } from '../../redux/actions.js'
import {store} from '../../redux'


export default class Splash extends React.Component {
    constructor(props) {
        super(props)

    }

    async componentDidMount() {
        ShareMenu.getSharedText((text :string) => {
            if (text && text.length) {
                store.dispatch(onRecieveShareMessage(text))
                setNavigator(this.props.navigation)
            } else {
                store.dispatch(enterSplash())
                store.dispatch(navigate(this.props.navigation))
            }
        })
    }

    render() {
    return (
        <View style={styles.container}>
            <Image style={{ width: 320, height: 80 }}
                source={require('../../assets/logo.png')}
            />
        </View>
    )
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});
