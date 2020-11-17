import React, { useState } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import Dashboard from '../Dashboard';
import MoisturizeMe from '../MoisturizeMe';

function App() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'dashboard', title: 'Dashboard', icon: 'view-dashboard' },
    { key: 'moisturizeMe', title: 'MoisturizeMe', icon: 'flower' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    dashboard: Dashboard,
    moisturizeMe: MoisturizeMe,
  });
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

export default App;
