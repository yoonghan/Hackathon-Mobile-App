package com.rncarcontroller.ai;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import com.rncarcontroller.BuildConfig;

import ai.api.AIServiceException;
import ai.api.android.AIConfiguration;
import ai.api.android.AIDataService;
import ai.api.model.AIRequest;
import ai.api.model.AIResponse;
import java.util.concurrent.ExecutionException;

/**
 * Created by mmpkl05 on 8/2/17.
 */
public class AiController {

    private final String TAG = "AIService";
    private final String CLIENT_ACCESS_TOKEN = BuildConfig.APIAI_ACCESS_TOKEN;
    private AIDataService aiDataService;

    public AiController(Context context) {
        final AIConfiguration config = new AIConfiguration(CLIENT_ACCESS_TOKEN,
                ai.api.AIConfiguration.SupportedLanguages.English,
                AIConfiguration.RecognitionEngine.System);

        aiDataService = new AIDataService(context, config);
    }

    public AIResponse sendRequest(String requestText) {
        final AIRequest aiRequest = new AIRequest();
        aiRequest.setQuery(requestText);

        AsyncTask<AIRequest, Void, AIResponse> aiTrigger = new AsyncTask<AIRequest, Void, AIResponse>() {
            @Override
            protected AIResponse doInBackground(AIRequest... requests) {
                final AIRequest request = requests[0];
                try {
                    Log.d(TAG, "AIRequest with request:" +request);
                    final AIResponse response = aiDataService.request(request);
                    Log.d(TAG, "AIResponse with result:" +response);
                    return response;
                } catch (AIServiceException e) {
                    e.printStackTrace();
                }
                return null;
            }
            @Override
            protected void onPostExecute(AIResponse aiResponse) {
                if (aiResponse != null) {
                    // process aiResponse here
                }
            }
        };

        try {
            return aiTrigger.execute(aiRequest).get();
        } catch (InterruptedException e) {
            return null;
        } catch (ExecutionException e) {
            return null;
        }


    }
}
