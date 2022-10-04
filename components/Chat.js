import React, { useEffect, useState } from 'react';

import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

export default function Chat(props) {
  // name and color
  const { name, color } = props.route.params;

  // messages state
  const [messages, setMessages] = useState([]);

  // whether user is offline
  const [isConnected, setIsConnected] = useState();

  // User id state
  const [uuid, setUuid] = useState();
  const [user, setUser] = useState({
    _id: '',
    name: '',
    avatar: '',
  });

  const messagesRef = collection(db, 'messages');

  // Offline --- setup async storage
  // save messages to async storage
  const saveMessages = async messages => {
    try {
      console.log('local messages: ', messages);
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.log(error.message);
    }
  };
  // retrieve messages from async storage
  const getMessages = async () => {
    let saveMessages = '';
    try {
      saveMessages = (await AsyncStorage.getItem('messages')) || [];
      setMessages(JSON.parse(saveMessages));
    } catch (error) {
      console.log(error.message);
    }
  };

  // delete messages
  const deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
      setMessages([]);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    // set screen title to the user name entered in the start screen
    props.navigation.setOptions({ title: name });

    // create variable to hold unsubsriber
    let unsubscribe;

    // check if user is offline or online using NetInfo
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });

    // if user is online, retrieve messages from firebase store, if offline use AsyncStorage
    if (isConnected === true) {
      // create a query to the messages collection, retrieving all messages sorted by their date of creation
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));

      // onSnapshot returns an unsubscriber, listening for updates to the messages collection
      unsubscribe = onSnapshot(messagesQuery, onCollectionUpdate);

      // delete old messages from asyncstorage
      deleteMessages();
      // save new messages to asyncStorage
      saveMessages();

      // unsubsribe snapshot listener on unmount
      return () => unsubscribe();
    } else {
      // load messages from asyncStorage
      getMessages();
    }
  }, []);

  // add message to firestore collection
  const addMessage = message => {
    addDoc(messagesRef, {
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: user,
    });
  };

  const onSend = (messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );
    addMessage(messages[0]);
  };

  const onCollectionUpdate = querySnapshot => {
    const messages = [];
    querySnapshot.forEach(doc => {
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    setMessages(messages);

    saveMessages(messages);
  };

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: 'black',
          },
        }}
        wrapperStyle={{
          left: {
            backgroundColor: 'pink',
          },
          right: {
            backgroundColor: 'lightblue',
          },
        }}
      />
    );
  };
  const renderCustomActions = props => {
    return <CustomActions {...props} />;
  };
  const renderCustomView = props => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  // hide input bar if user is online so that they cannot create or send messages
  const renderInputToolbar = props => {
    if (!isConnected) {
      // hide Toolbar
    } else {
      // display Toolbar
      return <InputToolbar {...props} />;
    }
  };
  return (
    <View style={[{ backgroundColor: color }, styles.container]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        renderInputToolbar={renderInputToolbar}
        showAvatarForEveryMessage={true}
        onSend={messages => onSend(messages)}
        user={{
          _id: user._id,
          name: name,
          avatar: user.avatar,
        }}
      />

      {/* avoid android overlap text */}
      {Platform.OS === 'android' ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
