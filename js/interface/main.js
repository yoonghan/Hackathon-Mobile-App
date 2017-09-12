import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  Image,
  ListView,
  NativeModules,
  NetInfo,
  Platform
} from 'react-native';
import Voice from 'react-native-voice';

import {askSpeechInput, getCommand, readText} from '../modules/modules';
import {commandCheck, advCommandCheck} from '../command/command';
import {createSocket} from '../util/websocket';

const QUESTIONER = "ASK";
const RESPONDER = "REPLY";
const EMERGENCY = "EMERGENCY";
const SYSTEM = "SYSTEM";

const NOTALK_IMG = require('../../img/talk.png');
const TALK_IMG = require('../../img/talk.png');
const NAVI_IMG = require('../../img/navi.gif');
const BOUNCY_IMG = require('../../img/bouncy.gif');

export default class MainView extends Component {

  constructor(props) {
    super(props);
    this._initVoice();
    this.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.listOfMessages = [];
    this.state = {
      listData: this.dataSource.cloneWithRows(this.listOfMessages),
      isConnected: false,
      isListening: false,
      isProcessing: false,
      showDialog: false
    };
    this.message = [];
    this.userId = '1000002';
    this.emergency = false;
  }

  componentDidMount() {
    this._initSocket();
  }

  _initSocket = () => {
    const self = this,
          websocket = createSocket();
    websocket.onopen = () => {
      //self._updateListOfMessage("[[Car System Connected]]", SYSTEM);
    };
    websocket.onmessage = (e) => {
      if(e.data === 'sei gan') {
        const responseMessage = '<prosody volume="x-loud">I detected an abnormality in your heartbeat!</prosody> Are you ok?';
        self._updateListOfMessage(responseMessage, EMERGENCY);
        self.emergencyCall(responseMessage);
      }
    };
    websocket.onclose = (e) => {
      //self._updateListOfMessage("[[Car System Shutdown]]", SYSTEM);
      setTimeout(self._initSocket, 1000);
    };
  }

  async emergencyCall(responseMessage) {
    const self = this;
    this.emergency = true;
    readText(responseMessage);
    setTimeout(
      function() {
        if(!self.state.isProcessing && !self.state.isListening) {
          self._onActivateSpeech();
        }
      }
      , 8000);
  }

  _initVoice = () => {
    Voice.onSpeechStart = this.onSpeechStartHandler.bind(this);
    Voice.onSpeechEnd = this.onSpeechEndHandler.bind(this);
    Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
    Voice.onSpeechError = this.onSpeechErrorHandler.bind(this);
  }

  onSpeechStartHandler(e) {
    this.message = [];
  }

  onSpeechEndHandler(e) {
  }

  onSpeechResultsHandler(e) {
    // askSpeechInput().then(function(response) {
    //   if(response && response.result) {
    //     const result = response.result;
    //     self._updateListOfMessage(result, QUESTIONER);
    //     self._execCommandBasedOnRequest(self, result);
    //   }
    // });
    this.message = e.value;
    if(Platform.OS !== 'ios') {
      this._process();
    }
  }

  onSpeechErrorHandler(e) {
    console.warn("Audio not allowed:" + e);
    this.setState({
      ...this.state,
      isListening: false,
      isProcessing: false
    });
  }

  _process = () =>{
    const arrResult = this.message;
    if(arrResult && arrResult[0] && arrResult[0] !== '') {
      const result = arrResult[0];
      this._updateListOfMessage(result, QUESTIONER);
      this._execCommandBasedOnRequest(this, result);
    }
    this.setState({
      ...this.state,
      isListening: false,
      isProcessing: false
    });
  }


  componentWillMount() {
    const self = this;
    NetInfo.addEventListener('change', this._handleFirstConnectivityChange);
    NetInfo.fetch().then((_reach) => {
      let connected = true;
      const reach = _reach.toLowerCase();
      if(reach === 'none' || reach === 'unknown') {
        connected = false;
      }
      self.setState({
        ...self.state,
        isConnected: connected
      });
    });
  }

  _handleFirstConnectivityChange = (reach) => {
    NetInfo.removeEventListener('change',this.handleFirstConnectivityChange);
  }

  _onActivateSpeech = () => {
    Voice.start('en');
    this.setState({
      ...this.state,
      isListening: true
    });
  }

  _onDeactivateSpeech = () => {
    Voice.stop();
    this.setState({
      ...this.state,
      isProcessing: true,
      isListening: false
    });
    if(Platform.OS === 'ios') {
      //android runs IN the process;
      this._process();
    }
  }

  async _execCommandBasedOnRequest(self, result) {
    let responseSpeech = 'I do not understand your command.';
    try {
      const aiResponse = await getCommand(result);
      if(this.emergency) {
        responseSpeech = advCommandCheck(this.userId, aiResponse.result, true);
        this.emergency = false;
      }
      else {
        responseSpeech = commandCheck(this.userId, aiResponse.result);
      }
    }
    catch(err) {
      console.warn(err);
      //do nothing
    }
    self._updateListOfMessage(responseSpeech, RESPONDER);
    readText(responseSpeech);
    self.setState({
      ...self.state,
      isProcessing: false
    });
  }

  _updateListOfMessage = (strMessage, whom) => {
    strMessage = strMessage.replace(/<.*?>/g, "");
    const message = {target : (whom ? whom : RESPONDER), message : strMessage};
    this.listOfMessages.unshift(message);
    this.setState({
      listData: this.dataSource.cloneWithRows(this.listOfMessages)
    });
  }

  _renderStopBtn = () => {
    return (
      <TouchableOpacity style={[styles.buttonContainer, styles.activeButton]}
        onPress={this._onDeactivateSpeech}>
        <Text style={styles.button}>Stop Listening</Text>
      </TouchableOpacity>
    );
  }

  _renderStartBtn = () => {
    const self = this;

    function _displayNonProcessingBtn() {
      return (
        <TouchableOpacity style={styles.buttonContainer}
          onPress={self._onActivateSpeech}>
          <Text style={styles.button}>Listen to Speech</Text>
        </TouchableOpacity>
      );
    }

    function _displayProcessingBtn() {
      return(
        <View style={[styles.buttonContainer, styles.disabledButtonContainer]}>
          <Text style={styles.button}>Processing</Text>
        </View>
      );
    }

    return (
      <View>
        {
          !this.state.isProcessing && _displayNonProcessingBtn()
        }
        {
          this.state.isProcessing && _displayProcessingBtn()
        }
      </View>
    );
  }

  _displaySpeech = () => {
    return(
      <View style={styles.container}>
        {(this.state.isListening || this.state.isProcessing) && <Image source={BOUNCY_IMG} style={[styles.bouncyImgContainer]}/>}
        <ListView
          enableEmptySections = {true}
          dataSource = {this.state.listData}
          renderRow = {(data) => <MessageRow {...data}/>} />
        {
          this.state.isListening && this._renderStopBtn()
        }
        {
          !this.state.isListening && this._renderStartBtn()
        }
      </View>
    );
  }

  _displayMessage = () => {
    return(
      <Text style={styles.connectionMessageContainer}>Babe, there{'\''}s no internet on your phone.</Text>
    );
  }

  _openDialog = (isOpen) => {
    this.setState({
      ...this.state,
      showDialog: isOpen
    });
  }

  _updateText = (text) => {
    this.userId = text;
  }

  render() {
    return (
      <Image source={NOTALK_IMG} style={styles.imageContainer}>
        <Text style={styles.welcome}>
          Vehicle Assistance
        </Text>
        {this.state.isConnected && this._displaySpeech()}
        {!this.state.isConnected && this._displayMessage()}
        <TouchableOpacity style={styles.naviImgContainer}
          onPress={() => this._openDialog(true)}>
          <Image source={NAVI_IMG} style={styles.naviImgInnerContainer}/>
        </TouchableOpacity>
        {
          this.state.showDialog &&
          <SimplePopUp displayUser={this.userId} textUpdateFunc={this._updateText} openDialogFunc={this._openDialog}/>
        }
      </Image>

    );
  }
}

class MessageRow extends Component {
  render() {

    const queryStyle =
      (this.props.target === QUESTIONER ? styles.messageAskContainer:
      (this.props.target === RESPONDER) ? styles.messageReplyContainer:
      (this.props.target === EMERGENCY) ? styles.messageEmergencyContainer:
      styles.messageSystemContainer);
    return(
      <View style={styles.messageRowContainer}>
        <Text style={queryStyle}>{this.props.message}</Text>
      </View>
    );
  }
}

class SimplePopUp extends Component {
  render() {
    const textUpdateFunc = this.props.textUpdateFunc;
    const openDialogFunc = this.props.openDialogFunc;
    return (
      <View style={styles.userIdContainer}>
        <Text>Enter user Id:</Text>
        <TextInput
          onChangeText={(text) => textUpdateFunc(text)}
          defaultValue={this.props.displayUser}
        />
        <TouchableOpacity style={styles.simplePopUpContainer}
          onPress={() => openDialogFunc(false)}>
          <Text> X </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  simplePopUpContainer: {
    position: 'absolute',
    top: 8,
    right: 10
  },
  userIdContainer: {
    height: 100,
    width: 300,
    position: 'absolute',
    right: 20,
    top: 80,
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    color: '#FFFFFF',
    fontSize: 30,
    textAlign: 'center',
    margin: 10,
  },
  messageRowContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 30,
    flexDirection: 'row'
  },
  messageAskContainer: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  messageSystemContainer: {
    fontSize: 10,
    color: '#005500'
  },
  messageReplyContainer: {
    color: '#00ADEF',
    fontSize: 18,
    marginLeft: 50
  },
  messageEmergencyContainer: {
    color: '#FF0000',
    fontSize: 20,
    padding: 10
  },
  connectionMessageContainer: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  buttonContainer: {
    width: 200,
    height: 50,
    margin: 10,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    //backgroundColor: '#E91E63'
  },
  activeButton: {
    //backgroundColor: '#9C27B0'
  },
  disabledButtonContainer: {
    //backgroundColor: '#F8BBD0'
  },
  button: {
    //fontWeight: 'bold',
    //color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 1
  },
  naviImgContainer: {
    width: 50,
    height: 39,
    position: 'absolute',
    top: 80,
    right: 30
  },
  naviImgInnerContainer: {
    width: 50,
    height: 39
  },
  bouncyImgContainer: {
    width: 113,
    height: 48
  }
});
