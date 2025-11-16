import CustomGoal from "@/components/CustomGoal";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const App = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    // Fetch or generate goals data
    const fetchGoals = async () => {
      const response = await fetch("http://localhost:3002/api/v1/goals");
      const data = await response.json();
      setGoals(data.data);
    };

    fetchGoals();
  }, []);

  return (
    <View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.header}>Focus</Text>
            <Text style={styles.subtitle}>Acheive Goals</Text>
          </View>

          
        </View>

        <View style={styles.progressContainer}>
          <Text>Today&apos;s Progress</Text>

          <View>
            <Text style={styles.header}>
              4.2 <Text>hrs</Text>
            </Text>
          </View>
        </View>

        {goals.map((goal, index) => (
          <CustomGoal key={index} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    padding: 24,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    fontWeight: "bold",
    color: "white",
    fontSize: 26,
  },
  scrollView: {
    paddingBottom: 100,
  },
  subtitle: {
    color: "grey",
    fontSize: 18,
  },
});

export default App;
