import {makePhoneCall, vehicleFlash, vehicleLockCarDoor, vehicleOpenCloseWindow} from '../modules/modules';
import {client, timeout} from '../util/connector';

const DOOR_CONTROL = "action.door";
const EMERGENCY_CALL = "action.call";
const HEALTHY_CALL = "action.health";
const UNKNOWN = "input.unknown";
const NOTHING = "nothing";

export function commandCheck(userId, aiResponse) {
  return advCommandCheck(userId, aiResponse, false);
}

export function advCommandCheck(userId, aiResponse, allowHealth) {
  const aiJson = JSON.parse(aiResponse);
  const action = aiJson.action;

  const message = aiJson.fulfillment.messages[0];
  if(message.type === 0 || message.platform === "DEFAULT") {
    const questionSpeech = aiJson.resolvedQuery;

    if(!allowHealth && (questionSpeech.toUpperCase() === 'YES' || questionSpeech.toUpperCase() === 'NO')) {
      return "Your command is too generic.";
    }

    const replySpeech = message.type===0? message.speech: message.speech[0];
    triggerCommand(userId, action, aiJson);
    setTimeout(function() {
      triggerExternalService(0, userId, questionSpeech, replySpeech);
    }, 2000);

    return replySpeech;
  }
  else {
    return "Message unsupported";
  }
}

async function triggerCommand(userId, action, aiJson) {
  const DOOR_CONTROL = "action.door";
  const WINDOW_CONTROL = "action.window";
  const EMERGENCY_CALL = "action.call";
  const HEALTHY_CALL = "action.health";
  const UNKNOWN = "input.unknown";
  const NOTHING = "nothing";

  switch(action) {
    case WINDOW_CONTROL:
      if(aiJson.parameters && aiJson.parameters.status){
        const toOpen = aiJson.parameters.status==="open" ? true: false;
        await vehicleOpenCloseWindow(toOpen);
      }
      break;
    case DOOR_CONTROL:
      if(aiJson.parameters && aiJson.parameters.status){
        const toOpen = aiJson.parameters.status==="open" ? true: false;
        await vehicleLockCarDoor(toOpen);
      }
      break;
    case EMERGENCY_CALL:
      await getPhoneNumber(userId, 0);
      await vehicleFlash();
      setTimeout(function() {
        vehicleLockCarDoor(false);
      }, 4000);
      setTimeout(function() {
        vehicleOpenCloseWindow(true);
      }, 8000);
      break;
    case HEALTHY_CALL:
    break;
    case UNKNOWN:
    break;
  }
}

async function triggerSMS(phoneNumber, name, location) {
  const smsData = {"phonenumber": phoneNumber, "message": name + " is in dire trouble. He/she is now in " + location};

  client.post('/api/sendSMS', smsData)
    .then(function (response) {
      if(response.status != 200) {
        console.warn("Invalid SMS trigger for server");
      }
    })
    .catch(function (error) {
      console.warn("Invalid SMS trigger"+error);
    })
}

async function getPhoneNumber(userId, counter) {
  const smsFunc = triggerSMS;
  await client.get('/api/user?userid='+userId)
    .then(function (response) {
      if(response.status === 200) {
        if(response && response.data && response.data.recordset && response.data.recordset[0]) {
          const contactNo = response.data.recordset[0].ContactNo;
          const name = response.data.recordset[0].Name;
          setTimeout(function() {
            makePhoneCall(contactNo);
          }, 12000);
          smsFunc(contactNo, name, 'Wisma Mercedes Benz(Lat: 3.055687, Long: 101.656)');
        }
      }
    })
    .catch(function (error) {
      if(counter === 0) {
        getPhoneNumber(userId, counter++);
      }

      console.warn("Invalid sql retrieval:"+error);
    });
}

async function triggerExternalService(counter, userId, question, answer) {
  const speechData = {"userid": userId, "question": question, "answer": answer};
  await client.post('/api/speech', speechData)
    .then(function (response) {
      if(response.status != 200) {
        console.warn("Invalid insert status:" + JSON.stringify(response));
      }
    })
    .catch(function (error) {
      if(counter === 0) {
        triggerExternalService(counter++, userId, question, answer);
      }
      console.warn("Invalid insert sql:" + error);
    });
}
