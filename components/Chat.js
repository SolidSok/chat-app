import React, { useEffect, useState } from 'react';

import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default function Chat(props) {
  // name and color
  const { name, color } = props.route.params;

  // messages state
  const [messages, setMessages] = useState([]);

  // whether user is offline
  const [isConnected, setIsConnected] = useState();

  // User id state
  const [uid, setUid] = useState();
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
    // Set the screen title to the user name entered in the start screen
    props.navigation.setOptions({ title: name });

    // Create variable to hold unsubsriber
    let unsubscribe;

    // Check if user is offline or online using NetInfo
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });

    // If user is online, retrieve messages from firebase store, if offline use AsyncStorage
    if (isConnected === true) {
      // Create a query to the messages collection, retrieving all messages sorted by their date of creation
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));

      // onSnapshot returns an unsubscriber, listening for updates to the messages collection
      unsubscribe = onSnapshot(messagesQuery, onCollectionUpdate);

      // Delete old messages from asyncstorage
      deleteMessages();
      // Save new messages to asyncStorage
      saveMessages();

      // unsubsribe snapshot listener on unmount
      return () => unsubscribe();
    } else {
      // Load messages from asyncStorage
      getMessages();
    }
  }, [isConnected]);

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
        user: data.user,
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
  renderCustomActions = props => {
    return <CustomActions {...props} />;
  };
  // Hide input bar if user is online so that they cannot create or send messages
  const renderInputToolbar = props => {
    if (!isConnected) {
      // Hide Toolbar
    } else {
      // Display Toolbar
      return <InputToolbar {...props} />;
    }
  };
  return (
    <View style={[{ backgroundColor: color }, styles.container]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        showAvatarForEveryMessage={true}
        onSend={messages => onSend(messages)}
        user={{
          _id: user._id,
          name: user.name,
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
