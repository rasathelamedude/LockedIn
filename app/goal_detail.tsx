import PomodoroTimer from "@/components/PomodoroTimer";
import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { getGoalById } from "@/services/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Goal {
  id: number;
  title: string;
  description: string | null;
  deadline: string;
  efficiency: number;
  timeLogged: number;
  color: string;
  milestones?: string[];
}

const GoalDetail = () => {
  const { id } = useLocalSearchParams();
  const [goal, setGoal] = useState<Goal | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Fetch goal details
      const fetchGoal = async () => {
        try {
          const goal = await getGoalById(Number(id));
          setGoal(goal as Goal);
        } catch (error) {
          console.error("Error fetching goal: ", error);
        }
      };

      fetchGoal();
    }, [id])
  );

  // Calculate days left
  const deadlineDate = new Date(goal?.deadline!);
  const today = new Date();
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / 86400000
  );

  // Loading screen
  if (!goal) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ textAlign: "center" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={"white"} />
          </TouchableOpacity>

          <View style={styles.efficiencyBadge}>
            <Text style={styles.efficiencyText}>{goal.efficiency + "%"}</Text>
          </View>
        </View>

        {/* Goal info section */}
        <View>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.description}>{goal.description}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>{daysLeft} days left</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="access-time"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>{goal.timeLogged} hrs logged</Text>
            </View>
          </View>
        </View>

        {/* Pomodoro timer */}
        <PomodoroTimer gradientColors={[goal.color, goal.color]} />

        {/* Milestones section */}
        <View style={styles.milestonesSection}>
          <View>
            <MaterialIcons name="flag" size={20} color={COLORS.text} />
            <Text style={styles.milestonesTitle}>Milestones</Text>
          </View>

          <View style={styles.milestonesList}>
            {goal.milestones?.map((milestone, index) => (
              <View
                key={index}
                style={[styles.milestoneCard, styles.milestoneCompleted]}
              >
                <Text style={styles.milestoneText}>{milestone}</Text>
              </View>
            ))}
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  efficiencyBadge: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  efficiencyText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  goalInfo: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  milestonesSection: {
    marginTop: SPACING.xl,
  },
  milestonesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  milestonesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  milestonesList: {
    gap: SPACING.sm,
  },
  milestoneCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  milestoneCompleted: {
    opacity: 0.6,
    borderColor: COLORS.textSecondary,
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  checkboxCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  milestoneText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  milestoneTextCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
});

export default GoalDetail;
