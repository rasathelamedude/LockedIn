import CustomGoal from "@/components/CustomGoal";
import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const App = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const response = await fetch("http://192.168.100.81:3002/api/v1/goals");
      const data = await response.json();
      setGoals(data.data);
    };

    fetchGoals();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FOCUS</Text>
            <Text style={styles.subtitle}>ACHIEVE GOALS</Text>
          </View>
        </View>

        {/* Today's Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>TODAY&apos;S PROGRESS</Text>
            <Text style={styles.onTrackText}>On Track</Text>
          </View>

          <Text style={styles.progressTime}>
            4.2 <Text style={styles.progressTimeUnit}>hrs</Text>
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={[COLORS.green, COLORS.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarFill}
            />
          </View>
        </View>

        {/* Goal Cards */}
        {goals.length === 0 ? (
          <Text>No goals found</Text>
        ) : (
          goals.map(
            (goal: {
              id: number;
              title: string;
              description: string;
              deadline: string;
              efficiency: number;
              timeLogged: string;
              gradientColors: string[];
            }) => (
              <CustomGoal
                key={goal.id}
                title={goal.title}
                description={goal.description}
                deadline={goal.deadline}
                efficiency={goal.efficiency}
                timeLogged={goal.timeLogged}
                gradientColors={goal.gradientColors}
              />
            )
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 68,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 2,
  },
  progressCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: 42,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  onTrackText: {
    fontSize: 13,
    color: COLORS.green,
    fontWeight: "600",
  },
  progressTime: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressTimeUnit: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "70%",
    height: "100%",
    borderRadius: 4,
  },
  noGoalsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.lg,
  },
});

export default App;
