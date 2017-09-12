import React, { Component } from 'react';
import { PermissionsAndroid } from 'react-native';

export async function checkPermission() {
  try {
    const grantPhoneCall = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        'title': 'Allow Emergency Contact',
        'message': 'This app requires permission granted to allow emergency phone contacts.'
      }
    )
    if(grantPhoneCall !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn("Phone call denied");
    }

    const grantRecordAudio = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        'title': 'Allow Audio Record',
        'message': 'This app requires permission granted to listen for audio.'
      }
    )
    if(grantRecordAudio !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn("Audio Recording is denied");
    }
    // const grantNetworkState = await PermissionsAndroid.request(
    //   PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE,
    //   {
    //     'title': 'Allow Network Check',
    //     'message': 'This app requires permission an internet check to closely monitors your health.'
    //   }
    // )
    // if(grantNetworkState === PermissionsAndroid.RESULTS.GRANTED) {
    //   console.warn("You can use the internet");
    // }
    // else {
    //   console.warn("Internet denied")
    // }
  }
  catch (err) {
    console.warn(err);
  }
}
