
import React, {useRef, useState, useEffect} from 'react';
import { StyleSheet, Modal, View, Text, Pressable, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { BlurView } from "@react-native-community/blur";

import * as BLE_C from '../constants/BLEConstants';

import { theme, colors } from '../styles/theme';


export default function MonitorModal({ visible, setModalVisible, device, ...props }) {

  const isMounted = useRef(null);
  const pollInterval = useRef(null);

  const [temperature, setTemperature] = useState(null);
  const [vled, setVLED] = useState(null);
  const [isns, setISNS] = useState(null);

  const logError = (charName, error) => console.warn(`(Settings-screen): Error in reading char: ${charName}`, error.message)

  const setState = (setter, state) => isMounted.current? setter(state) : null;

  const readTemperatureHandler = () => {
    device.readTempratureCharacteristics().then(
      (temperature) => setState(setTemperature, temperature),
      (error) => { logError("Temperature", error); setState(setTemperature, temperature)}
    )
  };

  const readVLEDHanlder = () => {
    device.readVLEDCharacteristics().then(
      (vled) => setState(setVLED, vled),
      (error) => { logError("VLED", error); setState(setVLED, null)}
    )
  };

  const readISNSHandler = () => {
    device.readISNSCharacteristics().then(
      (isns) => setState(setISNS, isns),
      (error) => { logError("ISNS", error); setState(setISNS, null)}
    )
  };

  const onStart = () => {
    isMounted.current = true;
    readTemperatureHandler();
    readVLEDHanlder();
    readISNSHandler();

    pollInterval.current = setInterval(() => {
      readTemperatureHandler();
      readVLEDHanlder();
      readISNSHandler();
    }, BLE_C.MONITOR_REFRESH_INTERVAL); // periodically read battery
  }

  const onDestroy = () => {
    isMounted.current = false;
    clearInterval(pollInterval.current);
  }

  useEffect(() => {
    if (device) onStart();
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
                  <Text style={[styles.propertyTitle, theme.textBold]}> {'?'} mV</Text>
                </View>

                <View style={styles.layoutProperty}>
                  <Text style={styles.propertyTitle}>MCU Temperature:</Text>
                  <Text style={[styles.propertyTitle, theme.textBold]}> {temperature ?? '?'} °C</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableOpacity>



            {/* <Pressable
              style={[theme.layoutProperty, styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
            <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable> */}
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
