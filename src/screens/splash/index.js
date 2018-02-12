import React from 'react';
import { StyleSheet, Image, View, AsyncStorage } from 'react-native';
import { NavigationActions } from 'react-navigation'

import { signin, start_app, navigate, enterSplash  } from '../../redux/actions.js'
import {store} from '../../redux'

export default class Splash extends React.Component {
    constructor(props) {
        super(props)
        store.dispatch(navigate(this.props.navigation))
    }

    async componentDidMount() {
        // const host = await AsyncStorage.getItem('default_host')
		// if(host) {
        //
		// } else {
		// 	await AsyncStorage.setItem('default_host', 'http://192.168.13.31/bpkservice')
		// }
        //
        // const token = await AsyncStorage.getItem('token')
		// if(token) {
		// 	const current_state = await AsyncStorage.getItem('current_state')
        //     setTimeout(() => {
        //         const resetAction = NavigationActions.reset({
        //                 index: 0,
        //                 actions: [
        //                     NavigationActions.navigate({ routeName: current_state})
        //                 ]
        //             })
        //         this.props.navigation.dispatch(resetAction)
        //     }, 1500)
		// } else {
			// await AsyncStorage.setItem('current_state', 'Login')
			// await AsyncStorage.removeItem('patient_host')
            // await AsyncStorage.removeItem('pos_host')
            // setTimeout(() => {
            //     const resetAction = NavigationActions.reset({
            //             index: 0,
            //             actions: [
            //                 NavigationActions.navigate({ routeName: 'Login'})
            //             ]
            //         })
            //     this.props.navigation.dispatch(resetAction)
            // }, 1500)
		// }
		store.dispatch(enterSplash())
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
