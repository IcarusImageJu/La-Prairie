import React from 'react';
import {Appbar} from 'react-native-paper'

function MoisturizeMe() {
  const _handleSearch = () => console.log('Searching');
  const _handleMore = () => console.log('Shown more');
    return(
       <>
        <Appbar.Header>
            <Appbar.Content title="La Prairie" subtitle="MoisturizeMe" />
        </Appbar.Header>
       </>
    )
}

export default MoisturizeMe;