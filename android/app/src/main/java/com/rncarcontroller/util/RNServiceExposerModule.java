package com.rncarcontroller.util;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.support.v4.content.ContextCompat;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.Gson;
import com.rncarcontroller.ai.AiController;
import com.rncarcontroller.car.CarController;
import com.rncarcontroller.voice.TextToSpeech;

import ai.api.model.AIResponse;

/**
 * Created by mmpkl05 on 8/17/17.
 */

public class RNServiceExposerModule extends ReactContextBaseJavaModule {

    private AiController aiController;
    private CarController carController;
    private TextToSpeech textToSpeech;
    private final static Gson GSON = new Gson();
    private final static String SPEECH_TYPE = "ssml";
    private final ReactContext reactContext;

    public RNServiceExposerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        init();
    }

    private void init() {
        this.aiController = new AiController(this.getReactApplicationContext());
        this.carController = new CarController(this.getReactApplicationContext());
        this.textToSpeech = new TextToSpeech(this.getReactApplicationContext(), SPEECH_TYPE);
    }

    @Override
    public String getName() {
        return "RNServiceExposerModule";
    }

    @ReactMethod
    public void vehicleFlash() {
        this.carController.soundCarLights();
    }

    @ReactMethod
    public void vehicleDoorLock(boolean isToLock) {
        this.carController.lockDoors(isToLock);
    }

    @ReactMethod
    public void vehicleOpenCloseWindow(boolean isToOpenWindow)
    {
        this.carController.openCloseWindow(isToOpenWindow);
    }

    @ReactMethod
    public void aiGetCommand(String requestText, Promise promise) {

        AIResponse aiResponse = aiController.sendRequest(requestText);

        WritableMap map = Arguments.createMap();

        if(aiResponse.getResult().getScore() > 0.8 && !"".equals(aiResponse.getResult().getFulfillment().getSpeech())) {
            String result =  GSON.toJson(aiResponse.getResult());
            map.putString("result", result);
            promise.resolve(map);
        }
        else {
            promise.reject("500", "No Match");
        }
    }

    @ReactMethod
    public void pollyReadOutVoice(String text) {
        textToSpeech.playVoice(text);
    }

    @ReactMethod
    public void makePhoneCall(String phoneNumber) {
        triggerPhoneCallIfAvailable(phoneNumber);
    }

    private void triggerPhoneCallIfAvailable(String _phoneNumber) {
        if(_phoneNumber != null) {
            String phoneNumber = "tel:" + _phoneNumber;
            Intent intent = new Intent(Intent.ACTION_CALL);
            intent.setData(Uri.parse(phoneNumber));
            if (ContextCompat.checkSelfPermission(reactContext,
                    Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                reactContext.startActivity(intent);
            }
            else {
                Toast.makeText(reactContext, "Phone call is not available", Toast.LENGTH_SHORT);
            }
        }
    }
}
