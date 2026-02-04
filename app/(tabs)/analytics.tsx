import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import {
  getTodayFocusHours,
  getWeeklyStats,
} from "@/database/queries/analytics";
import { getAllActiveGoals } from "@/database/queries/goals";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const Analytics = () => {
  const [todayHours, setTodayHours] = useState(0);
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({
    totalHours: 0,
    avgPerDay: 0,
    mostProductiveDay: "None",
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const hours = await getTodayFocusHours();
        const weeklyStats = await getWeeklyStats();
        const goals = await getAllActiveGoals();

        setTodayHours(hours);
        setActiveGoalsCount(goals.length);
        setWeeklyStats(weeklyStats);
      };

      fetchData();
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ANALYTICS</Text>
            <Text style={styles.subtitle}>TRACK YOUR PROGRESS</Text>
          </View>
          <MaterialIcons name="analytics" size={24} color={COLORS.orange} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Today's Hours */}
          <View style={styles.statCard}>
            <MaterialIcons
              name="today"
              size={24}
              color={COLORS.orange}
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{todayHours.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Hours Today</Text>
          </View>

          {/* Weekly Hours */}
          <View style={styles.statCard}>
            <MaterialIcons
              name="calendar-today"
              size={24}
              color={COLORS.orange}
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>
              {weeklyStats.totalHours.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          {/* Active Goals */}
          <View style={styles.statCard}>
            <MaterialIcons
              name="flag"
              size={24}
              color={COLORS.orange}
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{activeGoalsCount}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
        </View>

        {/* Weekly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>Daily Average</Text>
              <Text style={styles.overviewValue}>
                {weeklyStats.avgPerDay.toFixed(1)} hrs
              </Text>
            </View>
            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>Most Productive</Text>
              <Text style={styles.overviewValue}>
                {weeklyStats.mostProductiveDay}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  overviewCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  overviewLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  overviewValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
});

export default Analytics;
