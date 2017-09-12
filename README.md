# Introduction
Vehicle assistance for mobile application.

## 1. Installation for Android

1. Run the command

```
npm install
```

2. Setup polly in AWS.

3. For android users, change the file. Telematic api keys are as included in the codes itself in /android/app/build.gradle

```javascript
buildConfigField "String", "MERC_APP_CERT_1", "\"<<CERT KEY 1>>\""
buildConfigField "String", "MERC_APP_CERT_2", "\"<<CERT KEY 2>>=\""
buildConfigField "String", "MERC_APP_CERT_3", "\"<<CERT KEY 3>>\""
buildConfigField "String", "MERC_APP_TELEMATIC", "\"<<CERT KEY 4>>\""
buildConfigField "String", "AWS_COGNITO_POOL", "\"<<REGION>>:<<POOL>>\""
buildConfigField "String", "AWS_VOICE_ID", "\"<<VOICE>>\""
buildConfigField "String", "APIAI_ACCESS_TOKEN", "\"535bfcb807ff41569e4d5fad3c365366\""
```

4. For android users, enable the telematic only if necessary by changing the file /android/app/src/main/java/com/rncarcontroller/car/CarController

```java
/**Just enable the comment here**/
  Manager.getInstance().initialize(
          BuildConfig.MERC_APP_CERT_1,
          BuildConfig.MERC_APP_CERT_2,
          BuildConfig.MERC_APP_CERT_3,
          context
  );
  initializeTelematics();
```

5. Start up a mobile simulator or plugin an android phone in debug mode. Run the command
```
react-native run-android
```

## 2. Installation on iOS

1. Run the command

```
npm install
```

2. Setup polly in AWS.

3. Change the api's in Constant.swift.
```
let ApiAiKey = "535bfcb807ff41569e4d5fad3c365366"
let AwsRegion = AWSRegionType.USEast2
let AwsVoice = AWSPollyVoiceId.joanna
let AwsSpeechType = AWSPollyTextType.ssml
let AwsCognitoIdentityPoolId = "<<Polly aws cognition identity>>"
```

4. Start up simulator by plugin in a real device(does not work with simulator). Run the command
```
react-native run-ios
```

## 3. For more preview you can download via
https://play.google.com/apps/testing/com.rncarcontroller



Required to use gradlew instead of gradle
  ./gradlew assembleRelease
