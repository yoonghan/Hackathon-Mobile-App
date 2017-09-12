import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';
import {checkPermission} from './js/android/permission';

import MainView from './js/interface/main';

export default class RNCarController extends Component {

  constructor(props) {
    super(props);
    this._checkPermission();
  }

  /**
   * Required to check only for Android.
   **/
  _checkPermission() {
    checkPermission();
  }

  render() {
    return (
      <MainView/>
    );
  }
}

AppRegistry.registerComponent('RNCarController', () => RNCarController);
