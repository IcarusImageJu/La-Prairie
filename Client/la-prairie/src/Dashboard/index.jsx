import React from 'react';
import {Appbar} from 'react-native-paper'

function Dashboard() {
    return(
       <>
            <Appbar.Header>
                <Appbar.Content title="La Prairie" subtitle="Dashboard" />
            </Appbar.Header>
       </>
    )
}

export default Dashboard;