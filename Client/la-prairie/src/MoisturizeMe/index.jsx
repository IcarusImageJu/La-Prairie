import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import Tile from './Tile';

function MoisturizeMe() {
  const [controllers, setControllers] = useState([]);
  const [loading, setLoading] = useState(false);

  const call = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://192.168.2.37:1880/moisturizeme/controllers`);
      const resControllers = await res.json();
      setControllers(resControllers);
    } catch (error) {
      console.warn(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    call();
  }, []);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="La Prairie" subtitle="MoisturizeMe" />
      </Appbar.Header>
      <FlatList
        onRefresh={call}
        refreshing={loading}
        keyExtractor={(item) => item._id}
        data={controllers}
        renderItem={({ item }) => <Tile key={loading} controller={item} />}
      />
    </>
  );
}

export default MoisturizeMe;
