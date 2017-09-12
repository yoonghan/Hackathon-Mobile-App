package com.rncarcontroller.voice;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.AsyncTask;
import android.util.Log;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.polly.AmazonPollyPresigningClient;
import com.amazonaws.services.polly.model.OutputFormat;
import com.amazonaws.services.polly.model.SynthesizeSpeechPresignRequest;
import com.rncarcontroller.BuildConfig;

import java.io.IOException;
import java.net.URL;
import java.util.concurrent.ExecutionException;

/**
 * Created by mmpkl05 on 8/1/17.
 */
public class TextToSpeech {
    private static final String TAG = "TextToSpeech";

    private static final String VOICE_ID = BuildConfig.AWS_VOICE_ID;

    // Amazon Polly permissions.
    private static final String COGNITO_POOL_ID = BuildConfig.AWS_COGNITO_POOL;

    // Region of Amazon Polly.
    private static final Regions MY_REGION = Regions.US_EAST_2;

    CognitoCachingCredentialsProvider credentialsProvider;

    private AmazonPollyPresigningClient client;

    private String speechType;

    MediaPlayer mediaPlayer;

    public TextToSpeech(Context applicationContext, String speechType) {
        this.speechType = speechType;
        initPollyClient(applicationContext);
        setupNewMediaPlayer();
    }


    private void initPollyClient(Context applicationContext) {
        // Initialize the Amazon Cognito credentials provider.
        credentialsProvider = new CognitoCachingCredentialsProvider(
                applicationContext,
                COGNITO_POOL_ID,
                MY_REGION
        );

        // Create a client that supports generation of presigned URLs.
        client = new AmazonPollyPresigningClient(credentialsProvider);
    }

    private void setupNewMediaPlayer() {
        mediaPlayer = new MediaPlayer();
        mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
                mp.release();
                setupNewMediaPlayer();
            }
        });
        mediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                mp.start();
            }
        });
        mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
            @Override
            public boolean onError(MediaPlayer mp, int what, int extra) {
                return false;
            }
        });
    }

    /**
     * Main application will wait forever. Intended for demo purposes only.
     * @param textToRead
     */
    public void playVoice(String textToRead) {
        try {
            new PlayPollyVoice(textToRead).execute().get();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    }

    private class PlayPollyVoice extends AsyncTask<Void, Void, Void> {

        private final String textToRead;

        PlayPollyVoice(String textToRead) {
            this.textToRead = textToRead;
        }



        @Override
        protected Void doInBackground(Void... params) {
            // Create speech synthesis request.
            SynthesizeSpeechPresignRequest synthesizeSpeechPresignRequest =
                    new SynthesizeSpeechPresignRequest()
                            // Set only SSML support
                            .withTextType(speechType)
                            // Set text to synthesize.
                            .withText(this.textToRead)
                            // Set voice selected by the user.
                            .withVoiceId(VOICE_ID)
                            // Set format to MP3.
                            .withOutputFormat(OutputFormat.Mp3);

            // Get the presigned URL for synthesized speech audio stream.
            URL presignedSynthesizeSpeechUrl =
                    client.getPresignedSynthesizeSpeechUrl(synthesizeSpeechPresignRequest);
            // Create a media player to play the synthesized audio stream.
            if (mediaPlayer.isPlaying()) {
                setupNewMediaPlayer();
            }
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder().setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());

            try {
                // Set media player's data source to previously obtained URL.
                mediaPlayer.setDataSource(presignedSynthesizeSpeechUrl.toString());
            } catch (IOException e) {
                Log.e(TAG, "Unable to set data source for the media player! " + e.getMessage());
            }

            // Start the playback asynchronously (since the data source is a network stream).
            try {
                mediaPlayer.prepare();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(Void aVoid) {

        }
    }


}
