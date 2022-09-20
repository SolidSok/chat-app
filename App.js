import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

export default class HelloWorld extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.box1}></View>
        <View style={styles.box2}></View>
        <View style={styles.box3}></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  box1: {
    flex: 0.9,
    backgroundColor: 'green',
  },
  box2: {
    flex: 0.4,
    backgroundColor: 'red',
  },
  box3: {
    flex: 0.2,
    backgroundColor: 'blue',
  },
});
