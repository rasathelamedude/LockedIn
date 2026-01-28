import PomodoroTimer from "@/components/PomodoroTimer";
import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { Goal } from "@/database/queries/goals";
import { useGoalStore } from "@/store/goalStore";
import { useMilestoneStore } from "@/store/milestoneStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GoalDetail = () => {
  const { goalId } = useLocalSearchParams() as { goalId: string };
  const [goal, setGoal] = useState<Goal | null>(null);

  const getGoalWithId = useGoalStore((state) => state.getGoalWithId);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);

  const milestones = useMilestoneStore((state) => state.milestones);
  const getMilestonesWithGoalId = useMilestoneStore(
    (state) => state.getMilestonesWithGoalId,
  );
  const toggleMilestone = useMilestoneStore((state) => state.toggleMilestone);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        await getMilestonesWithGoalId(goalId);
      } catch (error) {
        console.error(`Error fetching milestones for goal ${goalId}: ${error}`);
      }
    };

    fetchMilestones();
  }, [getMilestonesWithGoalId, goalId]);

  useFocusEffect(
    useCallback(() => {
      const fetchGoal = async () => {
        try {
          const goalWithId = await getGoalWithId(goalId);
          setGoal(goalWithId);
        } catch (error) {
          console.error("Error fetching goal: ", error);
        }
      };

      fetchGoal();
    }, [getGoalWithId, goalId]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error loading goal.</Text>
      </View>
    );
  }

  // Calculate days left
  const daysLeft = goal?.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.efficiencyBadge}>
            <Text style={styles.efficiencyText}>
              {goal?.efficiency}% Complete
            </Text>
          </View>
        </View>

        {/* Goal Info Section */}
        <View style={styles.goalInfo}>
          <Text style={styles.title}>{goal?.title}</Text>
          <Text style={styles.description}>
            {goal?.description || "No description provided"}
          </Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>
                {daysLeft !== null ? `${daysLeft} days left` : "No deadline"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="access-time"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>
                {goal?.hoursLogged} hrs logged
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="flag"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>1 hr/day target</Text>
            </View>
          </View>
        </View>

        {/* Pomodoro Timer */}
        <PomodoroTimer
          gradientColors={[goal?.color, goal?.color] as [string, string]}
        />

        {/* Milestones Section */}
        <View style={styles.milestonesSection}>
          <View style={styles.milestonesHeader}>
            <MaterialIcons name="flag" size={20} color={COLORS.text} />
            <Text style={styles.milestonesTitle}>Milestones</Text>
          </View>

          <View style={styles.milestonesList}>
            {milestones.map((milestone) => (
              <TouchableOpacity
                key={milestone.id}
                onPress={async () => {
                  if (!milestone.completed) {
                    try {
                      await toggleMilestone(milestone.id);
                    } catch (error) {
                      Alert.alert("Error", "Could not complete milestone");
                    }
                  }
                }}
                disabled={milestone.completed}
                activeOpacity={milestone.completed ? 1 : 0.7}
                style={[
                  styles.milestoneCard,
                  milestone.completed && styles.milestoneCompleted,
                ]}
              >
                {/* Checkbox */}
                {milestone.completed ? (
                  <View style={styles.checkboxCompleted}>
                    <MaterialIcons name="check" size={16} color="#ffffff" />
                  </View>
                ) : (
                  <View style={styles.checkboxEmpty} />
                )}

                {/* Milestone Text */}
                <Text
                  style={[
                    styles.milestoneText,
                    milestone.completed && styles.milestoneTextCompleted,
                  ]}
                >
                  {milestone.title}
                </Text>
              </TouchableOpacity>
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
