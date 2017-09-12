//
//  RNServiceExposerModule.m
//  RNCarController
//
//  Created by mmpkl05 on 8/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNServiceExposerModule, NSObject)

RCT_EXTERN_METHOD(makePhoneCall:(NSString *)phoneNumber)

RCT_EXTERN_METHOD(aiGetCommand:(NSString *)queryCommand resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(pollyReadOutVoice:(NSString *)textToRead)

@end
