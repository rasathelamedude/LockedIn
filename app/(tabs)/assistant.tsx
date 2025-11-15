import React from "react";
import { StyleSheet, Text, View } from "react-native";

const assistant = () => {
  return (
    <View style={style.container}>
      <Text style={style.text}>Assistant</Text>
    </View>
  );
};

const style = StyleSheet.create({
  text: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 2.5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
});

export default assistant;
