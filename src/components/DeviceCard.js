import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Card, Text, Icon } from 'react-native-elements';
import Dialog from "react-native-dialog";

import AsyncStorage from '@react-native-async-storage/async-storage';

import MonitorModal from './MonitorModal';
import BatteryIndicator from './BatteryIndicator';
import RFIDIcon from '../icons/RFIDIcon';
import MonitorIcon from '../icons/MonitorIcon';

import theme from '../styles/theme';

export default function DeviceCard({ device, batteryLevel, batteryCharge,...props }) {


  const [modalRFIDVisible, setModalRFIDVisible] = useState(false);
  const [modalMonitorVisible, setModalMonitorVisible] = useState(false);

  const [promptVisible, setPromptVisible] = useState(false);
  const [deviceName, setDeviceName] = useState(device.device.name);
  const [dialogInput, setDialogInput] = useState(device.device.name);


  useEffect(() => {
    const fetchDeviceName = async () => {
      const storedName = await readDeviceName(device.getMAC());
      if (storedName) {
        setDeviceName(storedName)
        setDialogInput(storedName)
      }
    }
    fetchDeviceName()
  }, [device])


  const hideDialog = () => {
    setPromptVisible(false)
  }

  const showDialog = () => {
    setPromptVisible(true)
  }

  const handleDialogSubmit = async () => {
    hideDialog();
    await storeDeviceName(device.getMAC(), dialogInput)
    const value = await AsyncStorage.getItem('@storage_Key')
    setDeviceName(dialogInput)
  }

  const storeDeviceName = async (device_mac, nickname) => {
    await AsyncStorage.setItem(`@DEVICE__NAME:${device_mac}`, nickname)
  }

  const readDeviceName = async (device_mac) => {
    return await AsyncStorage.getItem(`@DEVICE__NAME:${device_mac}`)
  }

  const openRFIDModal = () => {
    setModalRFIDVisible(true);
    console.log("Modal opened");
  }

  const openMonitorModal = () => {
    setModalMonitorVisible(true);
  }

  return (
    <>
      <Card>
        <View style={{flexDirection: "row", justifyContent: "center"}}>
          <Card.Title style={styles.deviceTitle}>{deviceName} {"  "} </Card.Title>
          <Icon name={"pencil"} size={20} onPress={showDialog} />
        </View>
        <Card.Divider />
        <View style={theme.layout}>

          <View style={theme.layoutProperty}>
            <Text >Battery Level:</Text>
            <BatteryIndicator batteryLevel={batteryLevel}/>
          </View>

          <View style={theme.layoutProperty}>
            {
              batteryCharge !== null ?
                batteryCharge ?
                  <Text style={styles.batteryCharging}> Charging Device{"\n"} </Text>
                  :
                  <Text style={styles.batteryNotCharging}>Device On Battery{"\n"}</Text>
                : 
                <Text>-</Text> 
            }
          </View>

          <View style={theme.layoutProperty}>
            <TouchableOpacity onPress={openRFIDModal}>
              <RFIDIcon width={35}  height={35} fill={"white"}  />
            </TouchableOpacity>
            <TouchableHighlight onPress={openMonitorModal}>
              <MonitorIcon width={35} height={35} fill={"white"} />
            </TouchableHighlight>
          </View>
        </View>

      </Card>
      {
        modalMonitorVisible? <MonitorModal device={device} visible={true} setModalVisible={setModalMonitorVisible}></MonitorModal> : null
      }

      <Dialog.Container onBackdropPress={hideDialog} visible={promptVisible}>
        <Dialog.Title style={theme.dialogTitleText}>Rename Device</Dialog.Title>
        <Dialog.Description style={theme.dialogDescText}>
          Please enter new name of the device
        </Dialog.Description>
        <Dialog.Input style={theme.dialogDefaultText} onChangeText={setDialogInput} value={dialogInput} />
        <Dialog.Button style={theme.dialogButtons} label="Save" onPress={handleDialogSubmit} />
        <Dialog.Button style={theme.dialogButtons} label="Cancel" onPress={hideDialog} />
      </Dialog.Container>
    </>
  );
}

const styles = StyleSheet.create({

  propertyTitle: {
    fontSize: 16,
  },
  deviceTitle: {
    fontSize: 22
  },

  batteryCharging: {
    fontSize: 16,
    color: "#00ff00",
  },

  batteryNotCharging: {
    fontSize: 16,
    color: "#ff0000",
  },
});
