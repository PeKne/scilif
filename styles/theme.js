import { Card } from 'react-native-elements/dist/card/Card';

export const colors = {
  primary: '#ffffff',
  secondary: '#000000',
  yellow: '#FDEA00',
  red: '#FF2E00',

  battery0: '#ff0000',
  battery1: '#cb3c2c',
  battery2: '#f39c11',
  battery3: '#f0c30e',
  battery4: '#74ac0d',
  battery5: '#00ff00',
  batteryUnknown: '#909090',
};

const theme = {
  Text: {
    style: {
      color: colors.primary,
    },
    h1Style: {
      color: colors.yellow,
      fontSize: 30,
      textAlign: 'center',
      margin: 10
    },
  },

  Button: {
    type: 'clear',
    titleStyle: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 18,
    },
    buttonStyle: {
      borderColor: colors.primary,
    },
    containerStyle: {
      marginVertical: 10,
    },
  },

  Card: {
    containerStyle: {
      padding: 0,
      margin: 0,
      backgroundColor: colors.secondary,
    },
    wrapperStyle: {
      padding: 0,
      margin: 15,
      backgroundColor: colors.secondary,
    },

  },

  CardTitle: {
    style: {
      color: colors.primary,
    },
  },

  Divider: {
    style: {
      backgroundColor: colors.primary,
      marginHorizontal: '8%',
    },
  },

  Icon: {
    type: 'font-awesome',
    color: colors.primary,
  },
  ListItem: {
    style: {
      marginHorizontal: 5,
    },
  },
  ListItemTitle: {
    style: {
      fontSize: 18,
      color: colors.primary,
    },
  },

};

export default theme;
