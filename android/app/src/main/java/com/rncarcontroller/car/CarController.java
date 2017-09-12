package com.rncarcontroller.car;

import android.content.Context;
import android.util.Log;

import com.highmobility.hmkit.Command.WindowState;
import com.rncarcontroller.BuildConfig;

import com.highmobility.hmkit.*;
import com.highmobility.hmkit.Command.Command;
import com.highmobility.hmkit.Command.CommandParseException;
import com.highmobility.hmkit.Command.Incoming.IncomingCommand;
import com.highmobility.hmkit.Command.Incoming.LockState;
import com.highmobility.hmkit.Error.BroadcastError;
import com.highmobility.hmkit.Error.DownloadAccessCertificateError;
import com.highmobility.hmkit.Error.LinkError;
import com.highmobility.hmkit.Error.TelematicsError;

/**
 * Created by mmpkl05 on 8/5/17.
 */

public class CarController {

    private final String TAG = "VirtualCar";
    private byte[] serial = null;

    public CarController(Context context) {
      /** Remove comment here.
        Manager.getInstance().initialize(
                BuildConfig.MERC_APP_CERT_1,
                BuildConfig.MERC_APP_CERT_2,
                BuildConfig.MERC_APP_CERT_3,
                context
        );
        initializeTelematics();
      **/

      /** Bluetooth has issue, ignore this**/
        //workWithBluetooth();

    }

    /**
     * Possible to lock and unlock specific areas
     * @param isToOpenWindow
     */
    public void openCloseWindow(boolean isWindowOpen) {
        if(this.serial != null) {
            WindowState windowStates[] = {
                    new WindowState(WindowState.Location.FRONT_LEFT, isWindowOpen? WindowState.Position.OPEN: WindowState.Position.CLOSED) ,
                    new WindowState(WindowState.Location.FRONT_RIGHT, isWindowOpen? WindowState.Position.OPEN: WindowState.Position.CLOSED)
            };

            Manager.getInstance().getTelematics().sendCommand(Command.Windows.openCloseWindows(windowStates), serial, new Telematics.CommandCallback() {
                @Override
                public void onCommandResponse(byte[] bytes) {
                    Log.d(TAG, "Window");
                }

                @Override
                public void onCommandFailed(TelematicsError error) {
                    Log.d(TAG, "Could not send a command through telematics: " + error.getMessage());
                }
            });
        }
    }

    public void lockDoors(boolean isToLock) {
        if(this.serial != null) {
            Manager.getInstance().getTelematics().sendCommand(Command.DoorLocks.lockDoors(isToLock), serial, new Telematics.CommandCallback() {
                @Override
                public void onCommandResponse(byte[] bytes) {
                    try {
                        IncomingCommand command = IncomingCommand.create(bytes);

                        if (command.is(Command.DoorLocks.LOCK_STATE)) {
                            LockState state = (LockState) command;

                            Log.d(TAG, "Front left state: " + state.getFrontLeft());
                            Log.d(TAG, "Front right state: " + state.getFrontRight());
                            Log.d(TAG, "Rear right state: " + state.getRearRight());
                            Log.d(TAG, "Rear left state: " + state.getRearLeft());
                        }
                    }
                    catch (CommandParseException e) {
                        Log.e(TAG, e.getLocalizedMessage()   );
                    }
                }

                @Override
                public void onCommandFailed(TelematicsError error) {
                    Log.d(TAG, "Could not send a command through telematics: " + error);
                }
            });
        }
    }

    public void stopAll() {
        if(this.serial != null) {
            Manager.getInstance().getTelematics().sendCommand(Command.HonkFlash.startEmergencyFlasher(false), serial, new Telematics.CommandCallback() {
                @Override
                public void onCommandResponse(byte[] bytes) {
                    try {
                        IncomingCommand command = IncomingCommand.create(bytes);

                        if (command.is(Command.HonkFlash.EMERGENCY_FLASHER)) {
                            Log.d(TAG, "Car is honking and flashing");
                        }
                    }
                    catch (CommandParseException e) {
                        //Log.e(TAG, e.getLocalizedMessage()   );
                    }
                }

                @Override
                public void onCommandFailed(TelematicsError error) {
                    Log.d(TAG, "Could not send a command through telematics: " + error);
                }
            });
        }
    }

    public void soundCarLights() {
        if(this.serial != null) {
            Manager.getInstance().getTelematics().sendCommand(Command.HonkFlash.startEmergencyFlasher(true), serial, new Telematics.CommandCallback() {
                @Override
                public void onCommandResponse(byte[] bytes) {
                    try {
                        IncomingCommand command = IncomingCommand.create(bytes);

                        if (command.is(Command.HonkFlash.EMERGENCY_FLASHER)) {
                            Log.d(TAG, "Car is honking and flashing");
                        }
                    }
                    catch (CommandParseException e) {
                        //Log.e(TAG, e.getLocalizedMessage()   );
                    }
                }

                @Override
                public void onCommandFailed(TelematicsError error) {
                    Log.d(TAG, "Could not send a command through telematics: " + error);
                }
            });
        }
    }

    private void initializeTelematics() {
        Manager.getInstance().downloadCertificate(BuildConfig.MERC_APP_TELEMATIC, new Manager.DownloadCallback() {
            @Override
            public void onDownloaded(byte[] _serial) {
                Log.d(TAG, "Certificate downloaded for vehicle: " + _serial);
                serial = _serial;
            }

            @Override
            public void onDownloadFailed(DownloadAccessCertificateError error) {
                Log.d(TAG, "Could not download a certificate with token: " + error);
            }
        });
    }


    public void workWithBluetooth() {
        // Start Bluetooth broadcasting, so that the car can connect to this device
        final Broadcaster broadcaster = Manager.getInstance().getBroadcaster();

        broadcaster.setListener(new BroadcasterListener() {


            @Override
            public void onStateChanged(Broadcaster.State state) {
                Log.d(TAG, "Broadcasting state changed: " + state);
            }

            @Override
            public void onLinkReceived(ConnectedLink connectedLink) {
                Log.d(TAG, "Connectivity received");
                if (connectedLink.getState() == Link.State.AUTHENTICATED) {
                    Log.d(TAG, "Authenticated");
                    connectedLink.sendCommand(Command.Capabilities.getCapabilities(), new Link.CommandCallback() {
                        @Override
                        public void onCommandSent() {
                            Log.d(TAG, "Command successfully sent through Bluetooth");
                        }

                        @Override
                        public void onCommandFailed(LinkError linkError) {

                        }
                    });
                }


                connectedLink.setListener(new ConnectedLinkListener() {

                    @Override
                    public void onAuthorizationRequested(ConnectedLink connectedLink, ConnectedLinkListener.AuthorizationCallback authorizationCallback) {
                        // Approving without user input
                        Log.d(TAG, "Approved");
                        authorizationCallback.approve();
                    }

                    @Override
                    public void onAuthorizationTimeout(ConnectedLink connectedLink) {

                    }

                    @Override
                    public void onStateChanged(Link link, Link.State state) {
                        Log.d(TAG, "State changed");
                        if (link.getState() == Link.State.AUTHENTICATED) {

                            link.sendCommand(Command.Capabilities.getCapabilities(), new Link.CommandCallback() {
                                @Override
                                public void onCommandSent() {
                                    Log.d(TAG, "Command successfully sent through Bluetooth");
                                }

                                @Override
                                public void onCommandFailed(LinkError linkError) {

                                }
                            });
                        }
                    }

                    @Override
                    public void onCommandReceived(Link link, byte[] bytes) {
                        Log.d(TAG, "Command Received");
                        try {
                            IncomingCommand command = IncomingCommand.create(bytes);

                            if (command.is(Command.Capabilities.CAPABILITIES)) {

                                link.sendCommand(Command.VehicleStatus.getVehicleStatus(), new Link.CommandCallback() {
                                    @Override
                                    public void onCommandSent() {
                                        Log.d(TAG, "Command successfully sent through Bluetooth");
                                    }

                                    @Override
                                    public void onCommandFailed(LinkError linkError) {

                                    }
                                });
                            }
                            else if (command.is(Command.VehicleStatus.VEHICLE_STATUS)) {

                            }
                        }
                        catch (CommandParseException e) {
                            Log.e(TAG, e.getLocalizedMessage()   );
                        }
                    }

                });
            }

            @Override
            public void onLinkLost(ConnectedLink connectedLink) {
                Log.d(TAG, "Link lost");
                // Bluetooth disconnected
            }
        });

        broadcaster.startBroadcasting(new Broadcaster.StartCallback() {
            @Override
            public void onBroadcastingStarted() {
                Log.d(TAG, "Bluetooth broadcasting started");
            }

            @Override
            public void onBroadcastingFailed(BroadcastError broadcastError) {
                Log.d(TAG, "Bluetooth broadcasting started: " + broadcastError);
            }
        });
    }
}
