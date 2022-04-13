import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';

import { Icon } from 'react-native-elements';

export default function StatusBar({ navigation, ...props }) {
  return (
    <SafeAreaView style={styles.wrapper}>
      <Icon type="font-awesome" name="info-circle" color="#fff" onPress={() => navigation.navigate('Intro')} size={30} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: '4%',
    marginLeft: '12%',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
