import { NativeModules } from 'react-native';
import { Platform, StyleSheet } from 'react-native';
//Consist of both android and iOS codes
//Android && iOS
const { VoiceToTextModule, RNServiceExposerModule } = NativeModules;

export function askSpeechInput() {
  return VoiceToTextModule.askSpeechInput();
}

export function getCommand(commandInput) {
  if(Platform.OS === 'ios') {
    return RNServiceExposerModule.aiGetCommand(commandInput);
  }
  else {
    return RNServiceExposerModule.aiGetCommand(commandInput);
  }
}

export function readText(text) {
  return RNServiceExposerModule.pollyReadOutVoice('<speak>' + text + '</speak>')
}

export function makePhoneCall(phoneNumber) {
  if(Platform.OS === 'ios') {
    return RNServiceExposerModule.makePhoneCall(phoneNumber);
  }
  else {
    return RNServiceExposerModule.makePhoneCall(phoneNumber);
  }
}

export function vehicleFlash() {
  if(Platform.OS === 'ios') {
  }
  else {
    return RNServiceExposerModule.vehicleFlash();
  }
}

export function vehicleLockCarDoor(isToLock) {
  if(Platform.OS === 'ios') {
  }
  else {
    return RNServiceExposerModule.vehicleDoorLock(isToLock);
  }
}

export function vehicleOpenCloseWindow(isOpenWindow) {
  if(Platform.OS === 'ios') {
  }
  else {
    return RNServiceExposerModule.vehicleOpenCloseWindow(isOpenWindow);
  }
}
