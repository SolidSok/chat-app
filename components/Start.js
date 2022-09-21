import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

// background colors for App
const colors = {
  black: '#090C08',
  purple: '#474056',
  grey: '#8A95A5',
  green: '#B9C6AE',
};

export default function Start(props) {
  let [name, setName] = useState('');
  let [color, setColor] = useState();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/Background-Image.png')}
        style={styles.image}
        resizeMode="cover">
        <Text style={styles.title}>Chat App</Text>

        <View style={styles.box}>
          <TextInput
            onChangeText={name => setName(name)}
            value={name}
            style={styles.nameInput}
            placeholder="Your Name"
          />

          <Text style={styles.text}>Choose Background Color ({color}) </Text>

          <View style={styles.colorSet}>
            <TouchableOpacity
              // when using multiple styles, use an array
              style={[{ backgroundColor: colors.black }, styles.colorButton]}
              onPress={() => setColor(colors.black)}
            />
            <TouchableOpacity
              style={[{ backgroundColor: colors.purple }, styles.colorButton]}
              onPress={() => setColor(colors.purple)}
            />
            <TouchableOpacity
              style={[{ backgroundColor: colors.grey }, styles.colorButton]}
              onPress={() => setColor(colors.grey)}
            />
            <TouchableOpacity
              style={[{ backgroundColor: colors.green }, styles.colorButton]}
              onPress={() => setColor(colors.green)}
            />
          </View>
          <Pressable
            onPress={() =>
              props.navigation.navigate('Chat', { name: name, color: color })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'rgb(210, 230, 255)' : '#757083',
              },
              styles.buttonWrapper,
            ]}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  image: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  title: { fontSize: 45, fontWeight: '600', color: '#FFFFFF' },

  box: {
    backgroundColor: 'white',
    width: '88%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: '40%',
  },

  nameInput: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 50,
    borderColor: 'black',
    borderWidth: 2,
    width: '88%',
    height: 50,
    paddingLeft: 8,
  },
  text: { fontSize: 16, fontWeight: '300', color: '#757083', opacity: 100 },

  colorSet: {
    width: '88%',
    alignContent: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  colorButton: { width: 40, height: 40, borderRadius: 20 },

  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonWrapper: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 8,
    padding: 6,
    width: '88%',
    alignItems: 'center',
  },
});
