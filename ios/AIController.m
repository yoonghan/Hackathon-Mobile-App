//
//  AIController.m
//  RNCarController
//
//  Created by mmpkl05 on 8/24/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>


@interface RCT_EXTERN_MODULE(AIController, NSObject)

RCT_EXTERN_METHOD(aiGetCommand:(NSString *)queryCommand resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)


@end
