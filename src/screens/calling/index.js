'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
  ListView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native'
import {
    Icon
} from 'native-base'
import io from 'socket.io-client';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InCallManager from 'react-native-incall-manager';

let socket = io.connect('http://192.168.1.39:4443/', {transports: ['websocket']});

import { NavigationActions } from 'react-navigation'

import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';

const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

const pcPeers = {};
let localStream;

function getLocalStream(isFront, callback) {

  let videoSourceId;

  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      console.log("sourceInfos: ", sourceInfos);

      for (const i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
          videoSourceId = sourceInfo.id;
        }
      }
    });
  }
  getUserMedia({
    audio: true
  }, function (stream) {
    console.log('getUserMedia success', stream);
    callback(stream);
  }, logError);
}

function join(roomID) {
  socket.emit('join', roomID, function(socketIds){
    console.log('join', socketIds);
    for (const i in socketIds) {
      const socketId = socketIds[i];
      createPC(socketId, true);
    }
  });
}

function createPC(socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;

  pc.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
    }
  };

  function createOffer() {
    pc.createOffer(function(desc) {
      console.log('createOffer', desc);
      pc.setLocalDescription(desc, function () {
        console.log('setLocalDescription', pc.localDescription);
        socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
      }, logError);
    }, logError);
  }

  pc.onnegotiationneeded = function () {
    console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  }

  pc.oniceconnectionstatechange = function(event) {
    console.log('oniceconnectionstatechange', event.target.iceConnectionState);
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = function(event) {
    console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = function (event) {
    console.log('onaddstream', event.stream);
    container.setState({info: 'One peer join!'});

    const remoteList = container.state.remoteList;
    remoteList[socketId] = event.stream.toURL();
    container.setState({ remoteList: remoteList });
  };
  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream);
  };

  pc.addStream(localStream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    const dataChannel = pc.createDataChannel("text");

    dataChannel.onerror = function (error) {
      console.log("dataChannel.onerror", error);
    };

    dataChannel.onmessage = function (event) {
      console.log("dataChannel.onmessage:", event.data);
      container.receiveTextData({user: socketId, message: event.data});
    };

    dataChannel.onopen = function () {
      console.log('dataChannel.onopen');
      container.setState({textRoomConnected: true});
    };

    dataChannel.onclose = function () {
      console.log("dataChannel.onclose");
    };

    pc.textDataChannel = dataChannel;
  }
  return pc;
}

function exchange(data) {
  const fromId = data.from;
  let pc;
  if (fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
    pc = createPC(fromId, false);
  }

  if (data.sdp) {
    console.log('exchange sdp', data);
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function(desc) {
          console.log('createAnswer', desc);
          pc.setLocalDescription(desc, function () {
            console.log('setLocalDescription', pc.localDescription);
            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    console.log('exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  console.log('leave', socketId);
  const pc = pcPeers[socketId];
  const viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  const remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({ remoteList: remoteList });
  container.setState({ status: 'stop', info: 'One peer leave!' });
}

socket.on('exchange', function(data){
  exchange(data);
});
socket.on('leave', function(socketId){
  leave(socketId);
});

socket.on('connect', function(data) {
  console.log('connect');
  getLocalStream(true, function(stream) {
    localStream = stream;
    container.setState({selfViewSrc: stream.toURL()});
    container.setState({status: 'ready', info: 'Calling'});
  });
});

function logError(error) {
  console.log("logError", error);
}

function mapHash(hash, func) {
  const array = [];
  for (const key in hash) {
    const obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
}

function getStats() {
  const pc = pcPeers[Object.keys(pcPeers)[0]];
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    console.log('track', track);
    pc.getStats(track, function(report) {
      console.log('getStats report', report);
    }, logError);
  }
}

let container;


function after_leave() {
    socket.disconnect()
    Object.keys(pcPeers).forEach(function(key) {
        leave(key)
    })

    container.props.navigation.dispatch(NavigationActions.back())
}



export default class Calling extends React.Component {

    constructor(props) {
        super(props)
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
        this.state = {
            info: 'Initializing',
            status: 'init',
            roomID: '',
            isFront: true,
            selfViewSrc: null,
            remoteList: {},
            textRoomConnected: false,
            textRoomData: [],
            textRoomValue: '',
            mute: false,
            speaker: false
        }



    }

    componentDidMount() {
        container = this
        socket.connect()
        this._press()
    }

    _press = () => {
        InCallManager.setMicrophoneMute(false)
        InCallManager.setSpeakerphoneOn(false)
        this.setState({status: 'connect', info: 'Calling'});
        join('abc');
    }

    _switchVideoType = () => {
        const isFront = !this.state.isFront;
        this.setState({isFront});
        getLocalStream(isFront, function(stream) {
            if (localStream) {
                for (const id in pcPeers) {
                    const pc = pcPeers[id]
                    pc && pc.removeStream(localStream)
                }
                localStream.release()
            }
            localStream = stream
            this.setState({selfViewSrc: stream.toURL()})

            for (const id in pcPeers) {
                const pc = pcPeers[id];
                pc && pc.addStream(localStream);
            }
        });
    }

    receiveTextData = (data) => {
        const textRoomData = this.state.textRoomData.slice();
        textRoomData.push(data);
        this.setState({textRoomData, textRoomValue: ''});
    }

    _textRoomPress = () => {
        if (!this.state.textRoomValue) {
            return
        }
        const textRoomData = this.state.textRoomData.slice();
        textRoomData.push({user: 'Me', message: this.state.textRoomValue});
        for (const key in pcPeers) {
            const pc = pcPeers[key];
            pc.textDataChannel.send(this.state.textRoomValue);
        }
        this.setState({textRoomData, textRoomValue: ''});
    }

    _renderTextRoom = () => {
        return (
            <View style={styles.listViewContainer}>
            <ListView
                dataSource={this.ds.cloneWithRows(this.state.textRoomData)}
                renderRow={rowData => <Text>{`${rowData.user}: ${rowData.message}`}</Text>}
            />
            <TextInput
                style={{width: 200, height: 30, borderColor: 'gray', borderWidth: 1}}
                onChangeText={value => this.setState({textRoomValue: value})}
                value={this.state.textRoomValue}
            />
            <TouchableHighlight
                onPress={this._textRoomPress}>
                <Text>Send</Text>
            </TouchableHighlight>
            </View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>

                <View style={{ flex: 4 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column' }}>
                        <Image
                            resizeMethod={'resize'}
                            style={{
                                width: 130,
                                height: 130,
                                borderRadius: 65,
                                borderColor: 'white',
                                borderWidth: 1,
                                marginBottom: 15
                            }}
                            source={{ uri: "https://postmediacanoe.files.wordpress.com/2017/12/swift1000getty.jpg" }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 12 }}>Smnodame</Text>
                        <Text style={{ fontSize: 16, marginBottom: 20 }}>{ this.state.info }</Text>
                        {
                            this.state.status != 'stop' && <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={ () => {
                                        InCallManager.setSpeakerphoneOn(!this.state.speaker)
                                        this.setState({
                                            speaker: !this.state.speaker
                                        })
                                    }}
                                    style={{
                                        marginRight: 10,
                                        marginLeft: 10,
                                        backgroundColor:  !this.state.speaker? '#D3D3D3' : '#edb730',
                                        width: 70,
                                        height: 70,
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                     }}>
                                     <Icon name='md-volume-up' style={{ color: 'white', fontSize: 35 }}/>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={ () => {
                                        InCallManager.setMicrophoneMute(!this.state.mute)
                                        this.setState({
                                            mute: !this.state.mute
                                        })
                                    }}
                                    style={{
                                        marginRight: 10,
                                        marginLeft: 10,
                                        backgroundColor: !this.state.mute? '#D3D3D3' : '#edb730',
                                        width: 70,
                                        height: 70,
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                     }}>
                                     <Icon name='md-mic-off' style={{ color: 'white', fontSize: 35 }}/>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>



                </View>
                <View style={{ flex: 1 }}>

                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={ () => {
                                    after_leave()
                                }}
                                style={{
                                    backgroundColor: '#ff6666',
                                    width: 80,
                                    height: 80,
                                    borderRadius: 60,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                <MaterialCommunityIcons name='phone-hangup' style={{ color: 'white', fontSize: 35 }}/>
                            </TouchableOpacity>
                        </View>

                </View>
                <RTCView streamURL={this.state.selfViewSrc}/>
                {
                    mapHash(this.state.remoteList, function(remote, index) {
                        return <RTCView key={index} streamURL={remote}/>
                    })
                }
            </View>
        );
    }
}

// <Text style={styles.welcome}>
//     {this.state.info}
// </Text>
// {this.state.textRoomConnected && this._renderTextRoom()}
// <View style={{flexDirection: 'row'}}>
//     <Text>
//         {this.state.isFront ? "Use front camera" : "Use back camera"}
//     </Text>
//     <TouchableHighlight
//         style={{borderWidth: 1, borderColor: 'black'}}
//         onPress={this._switchVideoType}>
//         <Text>Switch camera</Text>
//     </TouchableHighlight>
// </View>
// { this.state.status == 'ready' ?
// (<View>
//     <TextInput
//     ref='roomID'
//     autoCorrect={false}
//     style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
//     onChangeText={(text) => this.setState({roomID: text})}
//     value={this.state.roomID}
//     />
//     <TouchableHighlight
//     onPress={this._press}>
//     <Text>Enter room</Text>
//     </TouchableHighlight>
//     </View>) : null
// }


const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 150,
  },
  remoteView: {
    width: 200,
    height: 150,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  listViewContainer: {
    height: 150,
  },
});
