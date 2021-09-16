import React from 'react';
import { Button, StyleSheet, Image, Text, View } from 'react-native';


export default function IntroScreen(props) {
    const navigation = { ...props };
    return (
        <View>
            <Image source={require("../resources/images/favicon.png")} />
            <Text>
                SunFibre Wearable Active Lighting Technology is a unique optic fibre lighting system that increases visibility in darkness or lowlight conditions. Unlike retroreflective safety elements, SCILIF SunFibre emits light through optic fibres encased in a textile coating, ensuring active protection. Side-emitting optic fibres provide visibility in all directions up to a distance of 3 kilometres. The properties of the textile coated optic fibre allow easy sewing into textile products and guaranteed mechanical durability and washability. The system is easy to operate and recharge.
            </Text>

            {/* <Button onPress={() => { navigation.navigate("TODO: screen name") }} title={"Connect device"} /> */}
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
});