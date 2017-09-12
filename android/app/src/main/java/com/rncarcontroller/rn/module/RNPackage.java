package com.rncarcontroller.rn.module;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.rncarcontroller.util.RNServiceExposerModule;
import com.rncarcontroller.voice.VoiceToTextModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by mmpkl05 on 8/16/17.
 */

public class RNPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new VoiceToTextModule(reactContext));
        modules.add(new RNServiceExposerModule(reactContext));

        return modules;
    }

}
