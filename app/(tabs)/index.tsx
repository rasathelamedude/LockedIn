import CustomGoal from "@/components/CustomGoal";
import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { getTodayFocusHours } from "@/database/queries/analytics";
import { Goal } from "@/database/queries/goals";
import { useGoalStore } from "@/store/goalStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  const [todayHours, setTodayHours] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const dailyHoursGoal = 8;

  const loadGoals = useGoalStore((state) => state.loadGoals);
  const goals = useGoalStore((state) => state.goals);
  const loading = useGoalStore((state) => state.loading);

  const fetchData = useCallback(async () => {
    await loadGoals();
    const hours = await getTodayFocusHours();
    setTodayHours(hours);
  }, [loadGoals]);

  // Fetch goals on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading && goals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.orange}
            colors={[COLORS.orange]}
          />
        }
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
            <Text
              style={todayHours >= 4 ? styles.onTrackText : styles.offTrackText}
            >
              {todayHours >= 4 ? "ON TRACK" : "OFF TRACK"}
            </Text>
          </View>

          <Text style={styles.progressTime}>
            {todayHours.toFixed(1)}{" "}
            <Text style={styles.progressTimeUnit}>hrs</Text>
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={[COLORS.green, COLORS.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, (todayHours / dailyHoursGoal) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Goal Cards */}
        {goals.length === 0 ? (
          <View style={styles.emptyGoalsContainer}>
            <View style={styles.emptyGoalsIconContainer}>
              <MaterialIcons name="flag" size={40} color="#3f3f3f" />
            </View>
            <Text style={styles.emptyGoalsTitle}>No Goals Yet</Text>
            <Text style={styles.emptyGoalsDescription}>
              Start your journey by creating your first goal. Stay locked in and
              finish what you start.
            </Text>
          </View>
        ) : (
          goals.map((goal: Goal) => (
            <CustomGoal
              key={goal.id}
              id={goal.id}
              title={goal.title}
              description={goal.description}
              deadline={goal.deadline}
              efficiency={goal.efficiency}
              hoursLogged={goal.hoursLogged}
              targetHours={goal.targetHours}
              color={goal.color}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create_goal")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.orange, COLORS.orangeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
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
  offTrackText: {
    fontSize: 13,
    color: COLORS.red,
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
    height: "100%",
    borderRadius: 4,
  },
  emptyGoalsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: 60,
  },
  emptyGoalsIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  emptyGoalsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyGoalsDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default Home;
