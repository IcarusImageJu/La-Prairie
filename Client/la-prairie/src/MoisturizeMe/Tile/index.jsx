import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Button, Card, Subheading } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const defaultConfig = {
  _id: null,
  controller: {
    name: 'loading',
  },
  moisturizers: [],
};

function Tile({ controller }) {
  const [config, setConfig] = useState(defaultConfig);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://192.168.2.37:1880/moisturizeme/configs/${controller._id}`);
        const [resConfig] = await res.json();
        setConfig(resConfig);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [controller._id]);

  useEffect(() => {
    if (config._id) {
      (async () => {
        const newData = {
          labels: [
            dayjs().subtract(6, 'day').get('date'),
            dayjs().subtract(5, 'day').get('date'),
            dayjs().subtract(4, 'day').get('date'),
            dayjs().subtract(3, 'day').get('date'),
            dayjs().subtract(2, 'day').get('date'),
            dayjs().subtract(1, 'day').get('date'),
            dayjs().get('date'),
          ],
          datasets: [],
          legend: [],
        };
        newData.datasets.pop();
        for (let index = 0; index < config.moisturizers.length; index += 1) {
          const {
            airValue,
            id,
            minMoistRatio,
            name,
            sensorPin,
            valvePin,
            valveTimer,
            waterValue,
          } = config.moisturizers[index];
          newData.datasets.push({
            data: [
              minMoistRatio,
              minMoistRatio,
              minMoistRatio,
              minMoistRatio,
              minMoistRatio,
              minMoistRatio,
              minMoistRatio,
            ],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          });
          newData.legend.push(`${name} min`);
          try {
            const res = await fetch(`http://192.168.2.37:1880/moisturizeme/values/${id}`);
            const resValues = await res.json();
            const dataForDatasets = [0, 0, 0, 0, 0, 0, 0];
            resValues.forEach(({ date, value }) => {
              const dayDate = dayjs(date).get('date');
              const place = 7 - (dayjs().get('date') - dayDate);
              dataForDatasets[place] = value;
            });
            newData.datasets.push({ data: dataForDatasets });
            newData.legend.push(name);
          } catch (error) {
            console.warn(error);
          }
        }

        setData(newData);
      })();
    }
  }, [config]);

  return (
    <Card>
      <Card.Title
        title={config.controller.name}
        subtitle={`Last seen online: ${dayjs(controller.date).fromNow()}`}
      />
      <Card.Content>
        {data && (
          <LineChart
            data={data}
            fromZero
            width={Dimensions.get('window').width - 20 - 12.5} // from react-native
            height={200}
            yAxisLabel="%"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 0, // optional, defaults to 2dp
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
        )}
      </Card.Content>
      {/* <Card.Actions>
        <Button>Edit</Button>
        <Button>Details</Button>
      </Card.Actions> */}
    </Card>
  );
}

Tile.propTypes = {
  controller: PropTypes.shape({
    _id: PropTypes.string,
    online: PropTypes.bool,
    date: PropTypes.number,
  }).isRequired,
};

export default Tile;
