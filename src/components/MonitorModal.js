
import React, {useRef, useState, useEffect, useContext} from 'react';
import { StyleSheet, Modal, View, Text, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { BlurView } from "@react-native-community/blur";

import { DevicesContext } from '../redux/DevicesContext';

import * as BLE_C from '../constants/BLEConstants';

import { theme, colors } from '../styles/theme';



export default function MonitorModal({ visible, setModalVisible, batteryVoltage, flashModeActive, ...props }) {

  const { controlledDevice } = useContext(DevicesContext);

  const isMounted = useRef(null);
  const polled = useRef(null);
  const pollInterval = useRef(null);
  const pollInterval2 = useRef(null);

  const [temperature, setTemperature] = useState(null);
  const [vled, setVLED] = useState(null);
  const [isns, setISNS] = useState(null);
  const [fwHw, setFwHw] = useState(null);

  const logError = (charName, error) => console.warn(`(Control-screen): Error in reading char: ${charName}`, error.message)

  const setState = (setter, state) => isMounted.current? setter(state) : null;

  const readFWHWVersionHandler = () => {
    controlledDevice.readFWHWVersionCharacteristics().then(
      (version) => setState(setFwHw, version),
      (error) => { 
        setState(setFwHw, null);
        logError("FwHW", error);
      }
    )
  }

  const readTemperatureHandler = () => {
    controlledDevice.readTempratureCharacteristics().then(
      (temperature) => setState(setTemperature, temperature),
      (error) => { 
        setState(setTemperature, null)
        polled.current |= 0x100;
        logError("Temperature", error);
      }
    )
  };

  const readVLEDHanlder = () => {
    controlledDevice.readVLEDCharacteristics().then(
      (vled) => setState(setVLED, vled),
      (error) => { 
        setState(setVLED, null);
        logError("VLED", error);
      }
    )
  };

  const readISNSHandler = () => {
    controlledDevice.readISNSCharacteristics().then(
      (isns) => setState(setISNS, isns),
      (error) => {
        setState(setISNS, null);
        polled.current |= 0x001;
        logError("ISNS", error);
      }
    )
  };

  const onStart = () => {
    isMounted.current = true;

    readFWHWVersionHandler();
    readTemperatureHandler();
    readVLEDHanlder();
    readISNSHandler();

    pollInterval.current = setInterval(() => {
        readVLEDHanlder();
        readISNSHandler();
    }, BLE_C.MONITOR_REFRESH_VLED_ISNS_INTERVAL); // periodically read

    pollInterval2.current = setInterval(() => {
        readTemperatureHandler();
    }, BLE_C.MONITOR_REFRESH_TEMPERATURE_INTERVAL); // periodically read
  }

  const onDestroy = () => {
    isMounted.current = false;
    clearInterval(pollInterval.current);
    clearInterval(pollInterval2.current);
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
                <Text style={theme.Text.h1Style}> Monitor</Text>
                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}> LED Voltage:</Text>
                  <Text style={[styles.propertyTitle, theme.textBold]}> {vled ?? '?'} mV </Text>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}> LED Current:</Text>
                  <Text style={[styles.propertyTitle, theme.textBold]}> {isns?? '?'} mA </Text>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}>Battery Voltage:</Text>
                  <Text style={[styles.propertyTitle, theme.textBold]}> {batteryVoltage ?? '?'} mV</Text>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}>MCU Temperature:</Text>
                  <Text style={[styles.propertyTitle, theme.textBold]}> {temperature ?? '?'} °C</Text>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}>FW/HW Version:</Text>
                  <Text style={[styles.propertyTitle, theme.textBold]}> {fwHw?? '?'}</Text>
                </View>

                { flashModeActive? 
                <View style={styles.layoutProperty}>
                  <Text style={[styles.propertyTitle, {color: "red", fontSize: 14}]}>In FLASH modes the ISNS/VLED values might not be accurate!</Text>
                </View> : null
                }
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({

  propertyTitle: {
    fontSize: 18,
    color: colors.primary
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
