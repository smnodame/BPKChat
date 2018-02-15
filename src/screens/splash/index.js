import React from 'react';
import { StyleSheet, Image, View, AsyncStorage } from 'react-native'
import { NavigationActions } from 'react-navigation'
import ShareMenu from 'react-native-share-menu'

import { signin, start_app, navigate, enterSplash  } from '../../redux/actions.js'
import {store} from '../../redux'


export default class Splash extends React.Component {
    constructor(props) {
        super(props)
        store.dispatch(navigate(this.props.navigation))
    }

    async componentDidMount() {
        ShareMenu.getSharedText((text :string) => {
            if (text && text.length) {
                console.log('text')
                console.log(text)
            } else {
                store.dispatch(enterSplash())
            }
        })
    }

    render() {
    return (
        <View style={styles.container}>
            <Image style={{ width: 320, height: 80 }}
                source={require('../../assets/images/logo.png')}
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
