import React, { useContext } from 'react';
import { StyleSheet, Image, View, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-elements';

import { DevicesContext } from '../redux/DevicesContext';
import { colors } from '../styles/theme';

const dimensions = Dimensions.get('window');

export default function IntroScreen({ navigation, permissionsGranted, ...props }) {

  const { controlledDevice } = useContext(DevicesContext);

  return (
    <View style={styles.screen}>
      <Image style={styles.logo} source={require('../../resources/images/logo.jpg')} />
      <Text style={styles.text}>
        SunFibre Wearable Active Lighting Technology is a unique optic fibre lighting system that increases visibility in darkness or lowlight conditions. Unlike retroreflective safety elements, SCILIF SunFibre emits light through optic fibres encased in a textile coating, ensuring active protection. Side-emitting optic fibres provide visibility in all directions up to a distance of 3 kilometres. The properties of the textile coated optic fibre allow easy sewing into textile products and guaranteed mechanical durability and washability. The system is easy to operate and recharge.
      </Text>

      <Button 
        disabled={!permissionsGranted}
        onPress={() => navigation.navigate(controlledDevice? 'Settings' : 'Connections')} 
        title="Control Device" titleStyle={styles.buttonTitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  logo: {
    marginTop: dimensions.height / 10,
    width: dimensions.width * 0.9,
    maxHeight: Math.round((dimensions.width * 9) / 60),
  },
  text: {
    paddingHorizontal: '3%',
    textAlign: 'justify',
  },

  buttonTitle: {
    textTransform: 'uppercase',
    color: colors.yellow,
  },
});
