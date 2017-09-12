//
//  TextToVoice.swift
//  RNCarController
//
//  Created by mmpkl05 on 8/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation
import AVFoundation

class TextToVoice: NSObject {
  
  let audioPlayer = AVPlayer()
  
  override init() {
    let credentialProvider = AWSCognitoCredentialsProvider(regionType: AwsRegion, identityPoolId: AwsCognitoIdentityPoolId)
    
    let awsConfiguration = AWSServiceConfiguration(
      region: AwsRegion,
      credentialsProvider: credentialProvider)
    AWSServiceManager.default().defaultServiceConfiguration = awsConfiguration
  }
  
  func readText(textToRead:String) {
    let input = AWSPollySynthesizeSpeechURLBuilderRequest()
    input.text = textToRead
    input.textType = AwsSpeechType
    input.outputFormat = AWSPollyOutputFormat.mp3
    input.voiceId = AwsVoice
    let builder = AWSPollySynthesizeSpeechURLBuilder.default().getPreSignedURL(input)
    
    builder.continueOnSuccessWith { (awsTask: AWSTask<NSURL>) -> Any? in
      let url = awsTask.result!
      // Try playing the data using the system AVAudioPlayer
      self.audioPlayer.replaceCurrentItem(with: AVPlayerItem(url: url as URL))
      self.audioPlayer.play()
      return nil
    }

  }
}
