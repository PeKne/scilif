
import React, {useRef, useState, useEffect, useContext} from 'react';
import { StyleSheet, Modal, View, TouchableWithoutFeedback, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';


import { BlurView } from "@react-native-community/blur";
import { NordicDFU, DFUEmitter } from "react-native-nordic-dfu";
import DocumentPicker from 'react-native-document-picker'
import * as Progress from 'react-native-progress';


import { DevicesContext } from '../redux/DevicesContext';

import * as BLE from '../services/BLEService';
import * as BLE_C from '../constants/BLEConstants';
import * as utils from '../services/UtilsService';
import { theme, colors } from '../styles/theme';


//TODO: handle disconnection 
//TODO: handle DFU failuers
//TODO: document picker path

export default function DFUModal({ visible, setModalVisible, ...props }) {

  const navigation = useNavigation(); 

  const DEFAULT_FILE = {uri: "/storage/emulated/0/dfu-app_blinky.zip"};
  const { controlledDevice } = useContext(DevicesContext);

  const DFUActivationSubscription = useRef(null);
  const [firmwareFile, setFirmwareFile] = useState(DEFAULT_FILE);
  const [dfuStarted, setDfuStarted] = useState(false);

  const [dfuProgress, setDfuProgress] = useState({percent: 0.0, part: 0, total: 0});


  const logError = (charName, error) => console.warn(`(Control-screen): Error in reading char: ${charName}`, error.message)

  const increaseMAC = (mac) => {
    try {
      let splits = mac.split(":");
      splits[splits.length-1] = (+splits.pop() + 1).toString();
      return splits.join(":");
    }
    catch(error){
      return null;
    }
  }

  const loadFW = () => {
    startDFU();

    let increasedMAC = increaseMAC(controlledDevice.getMAC());
    console.log(firmwareFile.uri, controlledDevice.getMAC(), increasedMAC);

    if (!increasedMAC) return;

    NordicDFU.startDFU({
      deviceAddress: increasedMAC,
      deviceName: "SunFibre - DFU",
      filePath: firmwareFile.uri,
    })
    .then((res) => console.log("Transfer done:", res))
    .catch(console.log);

    DFUEmitter.addListener("DFUProgress",
      ({ percent, currentPart, partsTotal, avgSpeed, speed }) => {
        console.log("DFU progress: " + percent + "%", currentPart, partsTotal);
        setDfuProgress({percent: percent/100, part: currentPart, total: partsTotal})
    });

    DFUEmitter.addListener("DFUStateChanged",
      ({ state }) => {
        console.log("DFU State:", state);

        if (state === "DFU_PROCESS_STARTING") {
          setDfuStarted(true);
        }

        if (state === "DEVICE_DISCONNECTING") {
          // failure
          if (dfuProgress.percent < 100) return;
          else return;
        }

        if (state === "DFU_COMPLETED") {
          navigation.navigate('Devices');
        }

      });
      
  }

  const cancelFW = () => {
    DFUEmitter.removeAllListeners('DFUProgress');
    DFUEmitter.removeAllListeners('DFUStateChanged');
  }


  const monitorDFUActivation = () => {
    try {
      DFUActivationSubscription.current = BLE.monitorCharacteristic(
        controlledDevice.getBLEDevice(), BLE_C.SERVICE_DFU_ACTIVATION,
        controlledDevice.getServiceCharacteristic(BLE_C.SERVICE_DFU_ACTIVATION, BLE_C.CHARACTERISTIC_DFU_BUTTONLESS).uuid, 
      (value) => {
        console.log("(Control-screen): DFU Activation response: ", utils.base64StrToHexStr(value));
      });
    }
    catch(error){ logError(monitorDFUActivation.name, error) }
  }

  const startDFU = () => {
    console.log("Starting DFU ");
    controlledDevice.writeDFUButtonlessCharacteristics(0x1)
    .catch(
      (error) => {
        console.error("DFU failed");
        logError(startDFU.name, error);
      }
    )
  };

  const loadFWFile = async () => {
    const fwFile = await DocumentPicker.pick({ type: DocumentPicker.types.zip })
    if (!fwFile.length) return;

    console.log(fwFile[0].uri);
    setFirmwareFile(fwFile[0]);
  }

  const onTouchOut = () => {
    if (!dfuStarted) setModalVisible(false);
  }


  const onStart = () => {
    monitorDFUActivation();
  }

  const onDestroy = () => {

    // remove DFU activation subscription
    if (DFUActivationSubscription.current){
      console.debug("(Control-screen): DFU Activation subscription removed");
      DFUActivationSubscription.current.remove();
      DFUActivationSubscription.current = null;

    }
    // remove all listeners
    cancelFW();

  }

  useEffect(() => {
    if (controlledDevice) onStart();
    return () => onDestroy();
  }, []);


  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible}>

         <TouchableOpacity style={[theme.layout, styles.layoutCenterd]} activeOpacity={1}  onPressOut={onTouchOut}>
          <View style={styles.layoutCenterd}>

            <BlurView style={styles.blurViewAbsolute} 
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="white"/>
            
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={theme.Text.h1Style}> DFU Upgrade</Text>

                <View style={[styles.layoutPropertyCenterd, {marginBottom:5}]}>
                  <Button type="outline" onPress={() => loadFWFile()} title="SELECT DFU PACKAGE"/>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}>{firmwareFile?.uri?.split("/").pop() ?? "At First, Select File!"}</Text>
                </View>

                { dfuStarted?
                  <View style={styles.layoutColumn} >

                    <View style={[styles.layoutProperty, {marginBottom: 5}]} >
                      <Text style={[styles.propertyTitle, theme.boldText]}>DFU Progress: </Text>
                      {/* <Text style={[styles.propertyTitle]}>{dfuProgress.part + '/' + dfuProgress.total }</Text> */}
                      <Text style={[styles.propertyTitle]}>{(dfuProgress.percent *100).toFixed(0)  + ' %'}</Text>
                    </View>

                    <View style={styles.layoutProperty} >
                      <Progress.Bar 
                        progress={dfuProgress.percent} 
                        width={200} 
                        color={colors.yellow} 
                        borderWidth={3}
                        borderColor={colors.yellow} /> 
                    </View>
                  </View> : null
                }


                <View style={styles.layoutProperty}>
                  <Button disabled={!firmwareFile || dfuStarted} type="outline" onPress={() => loadFW()} title="START"/>
                  <Button disabled={!firmwareFile || !dfuStarted} type="outline" onPress={() => cancelFW()} title="ABORT"/>
                </View>


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
    color: colors.primary
  },

  propertyTitle: {
    fontSize: 18,
    color: colors.primary
  },

  layoutCenterd: {
    flex: 1,
    justifyContent: "center",
  },

  layoutColumn: {
    flexDirection: 'column',
  },

  layoutProperty: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-around",
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
