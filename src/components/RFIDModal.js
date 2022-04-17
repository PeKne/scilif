
import React, {useRef, useState, useEffect, useContext} from 'react';
import { StyleSheet, Modal, View, Text, TouchableWithoutFeedback, TouchableOpacity, TextInput, Switch } from 'react-native';
import { BlurView } from "@react-native-community/blur";
import moment from 'moment';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DevicesContext } from '../redux/DevicesContext';

import * as BLE from '../services/BLEService';
import * as BLE_C from '../constants/BLEConstants';
import * as utils from '../services/UtilsService';

import { theme, colors } from '../styles/theme';



export default function RFIDModal({ visible, setModalVisible, ...props }) {

  const { controlledDevice } = useContext(DevicesContext);

  const [rfidEnabled, setRfidEnabled] = useState(null);
  const [rfidPairedTagID, setRfidPairedTagID] = useState(null);
  const [rfidDetectedTagID, setRfidDetectedTagID] = useState(null);

  const [rfidLastDetection, setRfidLastDetection] = useState(null);

  const isMounted = useRef(null);
  const pollInterval = useRef(null);
  const rfidDetectedTagIDSubscription = useRef(null);


  const logError = (charName, error) => console.warn(`(Control-screen): Error in reading char: ${charName}`, error.message)

  const setState = (setter, state) => isMounted.current? setter(state) : null;

  //NOTE: newRfidEnabled: number
  const writeRfidEnabledHandler = (newRfidEnabled) => {
    // preserve current mode
    let currentRfidEnabled = rfidEnabled;
    // set new mode immediately
    setState(setRfidEnabled, !!newRfidEnabled);
    controlledDevice.writeRfidEnabledCharacteristics(newRfidEnabled).then(
      () => {},
      (error) => {
        // restore old
        setState(setRfidEnabled, currentRfidEnabled);
        //TODO: output notification
        logError(writeRfidEnabledHandler.name, error)
      }
    )
  };


  const writeRfidPairedTagIdHandler = (newRfidPairedTagID) => {
    // preserve current mode
    let currentRfidPairedTagID = rfidPairedTagID;
    // set new mode immediately
    setState(setRfidPairedTagID, newRfidPairedTagID);
    controlledDevice.writeRfidPairedTagIDCharacteristics(newRfidPairedTagID).then(
      () => {},
      (error) => {
        // restore old mode
        setState(setRfidPairedTagID, currentRfidPairedTagID);
        //TODO: output notification
        logError(writeRfidPairedTagIdHandler.name, error)
      }
    )
  };

  const readRfidEnabledHanlder= () => {
    controlledDevice.readRfidEnabledCharacteristics().then(
      (rfidEnabled) => { 
        setState(setRfidEnabled, !!rfidEnabled);
      },
      (error) => { 
        setState(setRfidEnabled, null);
        logError("RFID Enabled", error);
      }
    )
  };

  const readRfidPairedTagIDHandler= () => {
    controlledDevice.readRfidPairedTagIDCharacteristics().then(
      (rfidPairedTagID) => {
        setState(setRfidPairedTagID, rfidPairedTagID); 
      },
      (error) => { 
        setState(setRfidPairedTagID, null); 
        logError("RFID Paired Tag ID", error);
      }
    )
  };

  // const readRfidDetectedTagIDHandler= () => {
  //   controlledDevice.readRfidDetectedTagIDCharacteristics().then(
  //     (rfidDetectedTagID) => {
  //       setState(setRfidDetectedTagID, rfidDetectedTagID); 
  //     },
  //     (error) => { 
  //       setState(setRfidDetectedTagID, null); 
  //       logError("RFID Paired Tag ID", error);
  //     }
  //   )
  // };

  const monitorRfidDetectedTagIDHandler = () => {
    try {
      rfidDetectedTagIDSubscription.current = BLE.monitorCharacteristic(
        controlledDevice.getBLEDevice(), BLE_C.SERVICE_RFID,
        controlledDevice.getServiceCharacteristic(BLE_C.SERVICE_RFID, BLE_C.CHARACTERISTIC_RFID_DETECTED_TAG_ID_IDX).uuid, 
      (value) => {
        console.log("(Control-screen): RFID Detected Tag ID, value has changed.", utils.base64StrToHexStr(value));
        let rfidDetectedTagID = utils.base64StrToUInt32(value);
        // update states
        setState(setRfidDetectedTagID, rfidDetectedTagID);
        setRfidLastDetection(Date.now());
        // save to local storage
        storeRfidDetectedTagID(controlledDevice.getMAC(), {tagID: rfidDetectedTagID, timestamp: Date.now()});
      });
    }
    catch(error){ logError(monitorRfidDetectedTagIDHandler.name, error) }
  }

  const pollRfidEnabledAndPairedTagIDHanlder = () => {

    pollInterval.current = setInterval(() => {
      readRfidEnabledHanlder();
      readRfidPairedTagIDHandler();
    }, BLE_C.RFID_MONITOR_REFRESH_INTERVAL); // periodically read
  }


  const readRfidDetectedTagID = (deviceMac) => {
    return AsyncStorage.getItem(`@DETECTED_TAG_ID:${deviceMac}`).then((data) => JSON.parse(data));
  }

  const storeRfidDetectedTagID = (deviceMac, rfidDetectedTagID) => {
    AsyncStorage.setItem(`@DETECTED_TAG_ID:${deviceMac}`, JSON.stringify(rfidDetectedTagID));
  }


  const onChangeRfidPairedTagID = (tagId) => {
    writeRfidPairedTagIdHandler(+tagId);
  }

  const onChangeRfidEnabled= (enabled) => {
    writeRfidEnabledHandler(+enabled);
  }



  const onStart = () => {
    isMounted.current = true;

    readRfidEnabledHanlder();
    readRfidPairedTagIDHandler();
    monitorRfidDetectedTagIDHandler();
    pollRfidEnabledAndPairedTagIDHanlder();

    readRfidDetectedTagID(controlledDevice.getMAC()).then(
      (rfidDetectedTagID) => {
        setRfidDetectedTagID(rfidDetectedTagID.tagID);
        setRfidLastDetection(rfidDetectedTagID.timestamp);
      }
    )
    .catch(() => {});
  }

  const onDestroy = () => {
    isMounted.current = false;
    clearInterval(pollInterval.current);

    if (rfidDetectedTagIDSubscription.current){
      console.debug("(Control-screen): RFID Detected Tag ID subscription removed");
      rfidDetectedTagIDSubscription.current.remove();
      rfidDetectedTagIDSubscription.current = null;
    }
  }

  useEffect(() => {
    if (controlledDevice) onStart();
    return () => onDestroy();
  }, []);


  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible}>

         <TouchableOpacity style={[theme.layout, styles.layoutCenterd]} activeOpacity={1}  onPressOut={() => setModalVisible(false)}>
          <View style={styles.layoutCenterd}>

            <BlurView style={styles.blurViewAbsolute} 
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="white"/>
            
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={theme.Text.h1Style}>RFID Monitor</Text>

                <View style={styles.layoutProperty}>
                  <Text style={styles.property}>RFID Enabled:</Text>
                  <Switch 
                    style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                    trackColor={{ false: "#767577", true: "#767577"}} 
                    thumbColor={rfidEnabled? "#f5dd4b": "#f4f3f4"}
                    onValueChange={onChangeRfidEnabled}
                    value={rfidEnabled}
                  />
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.property}>Paired Tag ID:</Text>
                  <TextInput 
                    style={[styles.property, styles.yellowBorder]}
                    onEndEditing={e => onChangeRfidPairedTagID(e.nativeEvent.text)} 
                    defaultValue={rfidPairedTagID?.toString()}
                    maxLength={10}
                    keyboardType="numeric" />
                </View>

                <View style={[styles.layoutProperty, {marginBottom:5}]}>
                  <Text style={styles.property}>Detected Tag ID:</Text>
                  <Text style={[styles.property, theme.textBold]}>{rfidDetectedTagID ?? ''}</Text>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.property}>Last Detection:</Text>
                  <Text style={[styles.property, theme.textBold]}>{(rfidLastDetection ? moment(rfidLastDetection).format('DD.MM HH:mm') : '')}</Text>
                </View>

                {/* <View style={styles.layoutProperty}>
                  <Text style={styles.property}>Paired Tag ID:</Text>
                  <Text style={[styles.property, theme.textBold]}>{(rfidPairedTagID === -1)? '-' : (rfidPairedTagID ?? '?')}</Text>
                </View> */}


              </View>

            </TouchableWithoutFeedback>

          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({

  property: {
    fontSize: 16,
    color: colors.primary
  },

  yellowBorder: {
    borderColor: colors.yellow,
    minWidth: 70,
    padding: 8,
    borderWidth: 1,
  },

  layoutCenterd: {
    flex: 1,
    justifyContent: "center",
  },

  layoutProperty: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },

  modalView: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderColor: colors.yellow,
    borderWidth: 5,
    padding: 30,
    margin: 30,
  },
  blurViewAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },

  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});
