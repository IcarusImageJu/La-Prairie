import React from 'react';
import {Appbar, Title} from 'react-native-paper'

function Dashboard() {
  const _handleSearch = () => console.log('Searching');
  const _handleMore = () => console.log('Shown more');
    return(
       <>
            <Appbar.Header>
                <Appbar.Content title="La Prairie" subtitle="Dashboard" />
                <Appbar.Action icon="magnify" onPress={_handleSearch} />
                <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
            </Appbar.Header>
       </>
    )
}

export default Dashboard;