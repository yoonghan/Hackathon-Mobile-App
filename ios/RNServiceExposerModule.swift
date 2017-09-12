//
//  RNServiceExposerModule.swift
//  RNCarController
//
//  Created by mmpkl05 on 8/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

import UIKit
import AVFoundation

extension Dictionary {
  init(_ pairs: [Element]) {
    self.init()
    for (k, v) in pairs {
      self[k] = v
    }
  }
}

@objc(RNServiceExposerModule)
class RNServiceExposerModule: NSObject {
  
  let apiai = ApiAI.shared()!
  let voiceToText = TextToVoice();
  
  override init() {
    let configuration: AIConfiguration = AIDefaultConfiguration()
    configuration.clientAccessToken = ApiAiKey
    apiai.configuration = configuration
  }
  
  @objc(makePhoneCall:)
  func makePhoneCall(phoneNumber: String) -> Void {
    UIApplication.shared.openURL(URL(string: "telprompt://" + phoneNumber)!)
  }
  
  @objc(pollyReadOutVoice:)
  func pollyReadOutVoice(textToRead: String) -> Void {
    voiceToText.readText(textToRead: textToRead)
  }
  
  @objc(aiGetCommand:resolver:rejecter:)
  func aiGetCommand(queryCommand:String,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    let apiRequest = apiai.textRequest()
    apiRequest?.query = [queryCommand]
    
    apiRequest?.setMappedCompletionBlockSuccess({ (request, response) in
      let response = response as! AIResponse
      
      if let result = response.result {
        let aiFulfillmentResponse: [String: Any] = [
          "messages": result.fulfillment.messages
        ]
        
        let aiParam = result.parameters as? [String: AIResponseParameter]
        let aiParametersResponse:Dictionary<String, String> = Dictionary((aiParam?.map({ (key, value) in
          (key, value.stringValue!)
        }))!)
        
        let aiResponse: [String: Any] = [
          "action": result.action!,
          "source": result.source,
          "resolvedQuery": result.resolvedQuery,
          "actionIncomplete": result.actionIncomplete,
          "fulfillment": aiFulfillmentResponse,
          "parameters": aiParametersResponse
        ]
        
        do{
          let jsonEncoder = try JSONSerialization.data(withJSONObject: aiResponse, options: .prettyPrinted)
          
          let jsonResponse: [String: String] = [
            "result": String(data: jsonEncoder, encoding: .ascii)!
          ]
          
          resolve(jsonResponse)
        }
        catch{
          reject("reject", "no response", error)
        }
        
      }
      else {
        let error = NSError(domain: "", code: 400, userInfo: [NSLocalizedDescriptionKey : "Result does not exist"])
        reject("reject", "no response", error)
      }
    }, failure: { (request, error) in
      reject("reject", "no response", error)
    })
    
    //    request?.setCompletionBlockSuccess({[unowned self] (request, response) -> Void in
    //      let resultNavigationController = self.storyboard?.instantiateViewController(withIdentifier: "ResultViewController") as! ResultNavigationController
    //
    //      resultNavigationController.response = response as AnyObject?
    //
    //      self.present(resultNavigationController, animated: true, completion: nil)
    //
    //      hud.hide(animated: true)
    //      }, failure: { (request, error) -> Void in
    //        hud.hide(animated: true)
    //    });
    
    apiai.enqueue(apiRequest)
  }
}
