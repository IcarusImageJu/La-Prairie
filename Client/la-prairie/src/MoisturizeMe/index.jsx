import React, { useState, useEffect } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { Appbar, Button, Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

function MoisturizeMe() {
  const [data, setData] = useState({
    labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    datasets: [
      {
        data: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
      },
    ],
  });
  async function getControllers() {
    try {
      const res = await fetch(`http://192.168.2.37:1880/moisturizeme/controllers`);
      const controller = await res.json();
      console.log(controller);
    } catch (error) {
      console.warn(error);
    }
  }
  async function getController(id) {
    try {
      const res = await fetch(`http://192.168.2.37:1880/moisturizeme/controllers/${id}`);
      const [controller] = await res.json();
      console.log(controller);
    } catch (error) {
      console.warn(error);
    }
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="La Prairie" subtitle="MoisturizeMe" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Card>
          <Card.Title title="Moisturizer test" subtitle="Humidité de la table" />
          <Card.Content>
            <LineChart
              data={data}
              width={Dimensions.get('window').width - 20 - 45} // from react-native
              height={100}
              yAxisLabel="$"
              yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={{
                borderRadius: 4,
              }}
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={getControllers}>Edit</Button>
            <Button>Details</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </>
  );
}

export default MoisturizeMe;
