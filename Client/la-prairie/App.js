/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-filename-extension */
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import App from './src/App';

dayjs.extend(relativeTime);

const darkJungleGreen = '#001514';
const white = '#FBFFFE';
const bloodRed = '#6B0504';
const chineseRed = '#A3320B';
const goldenrod = '#E6AF2E';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: bloodRed,
    accent: goldenrod,
  },
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar backgroundColor={darkJungleGreen} style="light" />
      <App />
    </PaperProvider>
  );
}
