//
//  CalendarManager.swift
//  RNCarController
//
//  Created by mmpkl05 on 8/23/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation

@objc(CalendarManager)
class CalendarManager: NSObject {
  
  @objc(addEvent:location:date:callback:)
  func addEvent(name: String, location: String, date: NSNumber, callback: (NSArray) -> ()) -> Void {
    NSLog("%@ %@ %@", name, location, date)
    callback( [[
      "name": name,
      "location": location,
      "date" : date
      ]])
  }
  
}
