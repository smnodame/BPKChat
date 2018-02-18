import React from 'react'
import {
  ListView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions
} from 'react-native'
import _ from 'lodash'
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
  RkButton
} from 'react-native-ui-kitten'
import Modal from 'react-native-modal'
import { Thumbnail, Icon, Text, Button } from 'native-base'
import {FontIcons} from '../../assets/icons'
import {store} from '../../redux'
import { onSelectKeep } from '../../redux/actions.js'
const paddingValue = 8



export default class GridMenu extends React.Component {

    constructor(props) {
        super(props)
        this.state = { dimensions: undefined }
    }

    _onLayout = event => {
        if (this.state.height)
            return;
        let dimensions = event.nativeEvent.layout
        this.setState({dimensions})
    }

    _getEmptyCount(size) {
        let rowCount = Math.ceil((this.state.dimensions.height - 20) / size)
        return rowCount * 3 - 13
    }

    render() {
        const navigate = this.props.screenProps.rootNavigation.navigate
        const MainRoutes = [
            {
                id: 'ProfileSettings',
                title: 'Profile',
                icon: FontIcons.profile,
                children: [],
                onPress: function() {
                    navigate('ProfileSettings')
                }
            },
            {
                id: 'keep',
                title: 'Keep',
                icon: FontIcons.article,
                children: [],
                onPress: function() {
                    store.dispatch(onSelectKeep())
                }
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
        ]

        let items = <View/>
        if (this.state.dimensions) {
            let size = this.state.dimensions.width / 3;
            let emptyCount = this._getEmptyCount(size);

            items = MainRoutes.map(function (route, index) {
                return (
                    <RkButton rkType='tile'
                        style={{height: size, width: size}}
                        key={index}
                        onPress={() => {
                            console.log(route.onPress())
                        }}>
                        <RkText style={styles.icon} rkType='primary moon xxlarge'>
                            {route.icon}
                        </RkText>
                        <RkText rkType='small'>{route.title}</RkText>
                    </RkButton>
                )
            });

            for (let i = 0; i < emptyCount; i++) {
                items.push(<View key={'empty' + i} style={[{height: size, width: size}, styles.empty]}/>)
            }
        }

        return (
            <ScrollView
                style={styles.root}
                onLayout={this._onLayout}
                contentContainerStyle={styles.rootContainer}>
                {items}
            </ScrollView>
        )
    }
}

let styles = RkStyleSheet.create(theme => ({
    root: {
        backgroundColor: theme.colors.screen.base,
        flex: 1
    },
    rootContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    empty: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.border.base
    },
    icon: {
        marginBottom: 16
    }
}))
