import React from 'react'
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Keyboard,
  Modal as ModalNative,
  Clipboard,
  Share,
  NativeModules,
  PermissionsAndroid
} from 'react-native'
import { InteractionManager, WebView } from 'react-native'
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten'
import _ from 'lodash'
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
import RNFetchBlob from 'react-native-fetch-blob'
import * as mime from 'react-native-mime-types'
import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'


export default class AudioPlayer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            progressText: '00:00',
            duration: 0,
            isLoading: false
        }
    }

    async componentDidMount() {

    }

    _play = async (audioPath) => {
        if(this.path) {
            this.setState({
                isLoading: true,
                progressText: 'Loading',
                playingAudio: true
            }, () => {
                this._start()
            })
        } else {
            this.setState({
                isLoading: true,
                progressText: 'Loading',
                playingAudio: true
            })

            this.fetchAudio = setTimeout(() => {
                RNFetchBlob
                .config({
                    // add this option that makes response data to be stored as a file,
                    // this is much more performant.
                    fileCache : true,
                })
                .fetch('GET', audioPath, {
                    //some headers ..
                })
                .then((res) => {
                    // the temp file path
                    console.log('The file saved to ', res.path())
                    this.duration = 0
                    this.sound = new Sound(res.path(), '', (error) => {
                        if (error) {
                            console.log('failed to load the sound', error)
                        }
                        this.path = res.path()
                        this.duration = Math.floor(this.sound.getDuration())
                        console.log('duration in seconds: ' + this.duration)
                        this._start()
                    })
                })
            }, 100)
        }
    }

    _start = async = () => {
        this.setState({
            isLoading: false
        })
        this.playAudio = setTimeout(() => {
            let seconds = 0
            this.refreshId = setInterval(() => {
                if(seconds == 0) {
                    this.sound.play((success) => {
                        if (success) {
                            this.setState({
                                playingAudio: false,
                                progressText: `${Math.floor(this.duration)} seconds`
                            })
                            console.log('successfully finished playing')
                        } else {
                            this.setState({
                                playingAudio: false,
                                progressText: `${Math.floor(this.duration)} seconds`
                            })
                            console.log('successfully finished playing')
                            console.log('playback failed due to audio decoding errors')
                        }
                    })
                }
                this.setState({
                    progressText: `${this.duration - Math.floor(seconds)} seconds`
                })
                if(seconds == this.duration) {
                    clearInterval(this.refreshId)
                }
                seconds = seconds + 1
            }, 1000)
        }, 100)
    }

    _stop = async () => {
        if(this.sound) {
            clearTimeout(this.playAudio)
            this.setState({
                playingAudio: false,
                progressText: `${Math.floor(this.duration)} seconds`
            }, () => {
                this.sound.stop()
                this.sound.setCurrentTime(0.0)
                clearInterval(this.refreshId)
            })
        }
    }

    render() {
        const backgroundColor = this.props.backgroundColor
    return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={{ flex: 1, borderColor: '#C0C0C0', borderBottomWidth: 0.5, marginBottom: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#C0C0C0', fontSize: 20 }}>{ this.state.progressText }</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flex: 1, borderColor: '#C0C0C0', borderRightWidth: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                        {
                            !this.state.playingAudio && <Button iconLeft transparent style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }} onPress={() => {
                                this._play(this.props.url)
                            }}>
                                <Icon name='md-play' style={{ color: '#C0C0C0' }}/>
                            </Button>
                        }
                        {
                            this.state.playingAudio && <Button disabled={this.state.isLoading} iconLeft transparent style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }} onPress={() => {
                                this._stop()
                            }}>
                                <Icon name='md-pause' style={{ color: '#C0C0C0' }}/>
                            </Button>
                        }
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Button iconLeft transparent style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }} onPress={() => {
                            const url = this.props.url
                            const arr = url.split('.')
                            const filetype = arr[arr.length - 1]

                            RNFetchBlob
                            .config({
                                addAndroidDownloads : {
                                    useDownloadManager : true, // <-- this is the only thing required
                                    // Optional, override notification setting (default to true)
                                    notification : true,
                                    // Optional, but recommended since android DownloadManager will fail when
                                    // the url does not contains a file extension, by default the mime type will be text/plain
                                    title: this.props.fileName,
                                    mime : mime.lookup(filetype),
                                    description : 'File downloaded by download manager.'
                                }
                            })
                            .fetch('GET', url)
                            .then((resp) => {
                              // the path of downloaded file
                              resp.path()
                            })
                        }}>
                            <Icon name='md-download' style={{ color: '#C0C0C0' }}/>
                        </Button>
                    </View>
                </View>
            </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  header: {
    alignItems: 'center'
  },
  additionHeader: {
      backgroundColor: 'white',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 999
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center'
  },
  avatar: {
    marginRight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  searchItemContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  list: {
    paddingHorizontal: 17
  },
  footer: {
    flexDirection: 'row',
    minHeight: 60,
    padding: 10,
    backgroundColor: theme.colors.screen.alter
  },
  item: {
    marginVertical: 14,
    flex: 1,
    flexDirection: 'row'
  },
  itemIn: {},
  itemOut: {
    alignSelf: 'flex-end'
  },
  balloon: {
    maxWidth:'60%',
    padding: 15,
    borderRadius: 20,
  },
  time: {
    alignSelf: 'flex-end',
    margin: 15
  },
  plus: {
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
},
row: {
  flexDirection: 'row',
  paddingHorizontal: 17.5,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderColor: theme.colors.border.base,
  alignItems: 'center'
},
}))
