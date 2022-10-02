import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';

const firebaseConfig = {
  apiKey: 'AIzaSyDZx1WRlCV1lsSIJ5J9vTAqRe4hCiWRfe8',
  authDomain: 'test-4595a.firebaseapp.com',
  projectId: 'test-4595a',
  storageBucket: 'test-4595a.appspot.com',
  messagingSenderId: '375148346004',
  appId: '1:375148346004:web:cd91fafaa0e039050dd281',
  measurementId: 'G-8RG2MBX8VG',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth();

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
  const saveMessages = async () => {
    try {
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

    //check if user is online/offline
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });

    if (isConnected) {
      const authUnsubscribe = onAuthStateChanged(auth, async user => {
        if (!user) {
          await signInAnonymously(auth);
        }

        // Set states for user uid and logged in text
        setUid(user.uid);
        setMessages([]);
        setUser({
          _id: user.uid,
          name: name,
          avatar: 'https://placeimg.com/140/140/any',
        });
        // Delete previously saved messages in asyncStorage
        deleteMessages();
        // Save messages to asyncStorage
        saveMessages();

        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(messagesQuery, onCollectionUpdate);
      });
      return () => {
        authUnsubscribe();
      };
    } else {
      getMessages();
    }
  }, [isConnected]);

  // add message to firestore collection
  const addMessage = message => {
    addDoc(messagesRef, {
      uid: uid,
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
