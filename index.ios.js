/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import MainView from './js/interface/main';

export default class RNCarController extends Component {
  //
  // async responseRunner() {
  //   var AIController = NativeModules.RNServiceExposerModule;
  //   let aiResponse = await AIController.aiGetCommand('Hello');
  //   //let result = JSON.parse(aiResponse).result;
  //   console.warn(JSON.stringify(aiResponse.result));
  // }
  //
  // makePhoneCall() {
  //   NativeModules.RNServiceExposerModule.makePhoneCall("0162107810");
  // }
  //
  // readText() {
  //   console.warn("Reading Text");
  //   NativeModules.RNServiceExposerModule.readText("<speak>Hello to 0162107810</speak>");
  // }

  render() {

    return (
      <MainView/>
    );
  }
}

AppRegistry.registerComponent('RNCarController', () => RNCarController);
