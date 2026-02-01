import PomodoroTimer from "@/components/PomodoroTimer";
import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { Goal } from "@/database/queries/goals";
import { useGoalStore } from "@/store/goalStore";
import { useMilestoneStore } from "@/store/milestoneStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const GoalDetail = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const [goal, setGoal] = useState<Goal | null>(null);

  const getGoalWithId = useGoalStore((state) => state.getGoalWithId);
  const deleteGoal = useGoalStore((state) => state.deleteGoal);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);

  const milestones = useMilestoneStore((state) => state.milestones);
  const getMilestonesWithGoalId = useMilestoneStore(
    (state) => state.getMilestonesWithGoalId,
  );
  const createMilestone = useMilestoneStore((state) => state.createMilestone);
  const toggleMilestone = useMilestoneStore((state) => state.toggleMilestone);
  const deleteMilestone = useMilestoneStore((state) => state.deleteMilestone);

  const fetchData = useCallback(async () => {
    try {
      const [goalData] = await Promise.all([
        getGoalWithId(id),
        getMilestonesWithGoalId(id),
      ]);

      setGoal(goalData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, [getGoalWithId, getMilestonesWithGoalId, id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleAddMilestone = () => {
    Alert.prompt(
      "New Milestone",
      "Enter milestone title",
      async (text) => {
        if (!text || !text.trim()) return;

        try {
          const nextOrderIndex = milestones.length;
          await createMilestone({
            goalId: id,
            title: text.trim(),
            orderIndex: nextOrderIndex,
          });

          await getMilestonesWithGoalId(id);
          Toast.show({
            type: "success",
            text1: "Milestone Created!",
            text2: "Keep building towards your goal.",
            position: "top",
            visibilityTime: 2000,
          });
        } catch (error) {
          Alert.alert("Error", "Could not create milestone");
          console.error(error);
        }
      },
      "plain-text",
    );
  };

  const handleDeleteMilestone = (
    milestoneId: string,
    milestoneTitle: string,
  ) => {
    Alert.alert("Delete Milestone", `Delete "${milestoneTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMilestone(milestoneId);
            await getMilestonesWithGoalId(id);
            Toast.show({
              type: "info",
              text1: "Milestone Deleted",
              position: "top",
              visibilityTime: 2000,
            });
          } catch (error) {
            Alert.alert("Error", "Could not delete milestone");
          }
        },
      },
    ]);
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(id);
              Toast.show({
                type: "success",
                text1: "Goal Deleted",
                text2: "The goal has been removed.",
                position: "top",
                visibilityTime: 2000,
              });
              router.back();
            } catch (error) {
              Alert.alert("Error", "Could not delete goal");
              console.error(error);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !goal) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error loading goal.</Text>
      </View>
    );
  }

  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const hoursPerDay =
    goal.deadline && daysLeft && daysLeft > 0
      ? ((goal.targetHours - goal.hoursLogged) / daysLeft).toFixed(1)
      : "N/A";

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

          <View style={styles.headerRight}>
            <View
              style={[
                styles.efficiencyBadge,
                {
                  backgroundColor:
                    goal.efficiency && goal.efficiency >= 90
                      ? COLORS.green + "30"
                      : goal.efficiency && goal.efficiency >= 70
                        ? COLORS.orange + "30"
                        : COLORS.red + "30",
                },
              ]}
            >
              <Text
                style={[
                  styles.efficiencyText,
                  {
                    color:
                      goal.efficiency && goal.efficiency >= 90
                        ? COLORS.green
                        : goal.efficiency && goal.efficiency >= 70
                          ? COLORS.orange
                          : COLORS.red,
                  },
                ]}
              >
                {goal.efficiency?.toFixed(1) ?? 0}% Efficient
              </Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/edit_goal?id=${id}`)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={20} color={COLORS.orange} />
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteGoal}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="delete-outline"
                size={22}
                color={COLORS.red}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal Info Section */}
        <View style={styles.goalInfo}>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.description}>
            {goal.description || "No description provided"}
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
                {goal.hoursLogged.toFixed(1)} / {goal.targetHours} hrs
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="trending-up"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>{hoursPerDay} hrs/day needed</Text>
            </View>
          </View>
        </View>

        {/* Pomodoro Timer */}
        <PomodoroTimer
          gradientColors={[goal.color, goal.color] as [string, string]}
          goalId={id}
        />

        {/* Milestones Section */}
        <View style={styles.milestonesSection}>
          <View style={styles.milestonesHeader}>
            <View style={styles.milestoneTitleRow}>
              <MaterialIcons name="flag" size={20} color={COLORS.text} />
              <Text style={styles.milestonesTitle}>Milestones</Text>
            </View>
            <TouchableOpacity
              style={styles.addMilestoneButton}
              onPress={handleAddMilestone}
            >
              <MaterialIcons name="add" size={20} color={COLORS.orange} />
            </TouchableOpacity>
          </View>

          {milestones.length > 0 ? (
            <View style={styles.milestonesList}>
              {milestones.map((milestone) => (
                <TouchableOpacity
                  key={milestone.id}
                  onPress={async () => {
                    if (!milestone.completed) {
                      try {
                        await toggleMilestone(milestone.id);
                        await getMilestonesWithGoalId(id);
                      } catch (error) {
                        Alert.alert("Error", "Could not complete milestone");
                      }
                    }
                  }}
                  onLongPress={() =>
                    handleDeleteMilestone(milestone.id, milestone.title)
                  }
                  disabled={milestone.completed}
                  activeOpacity={milestone.completed ? 1 : 0.7}
                  style={[
                    styles.milestoneCard,
                    milestone.completed && styles.milestoneCompleted,
                  ]}
                >
                  {milestone.completed ? (
                    <View style={styles.checkboxCompleted}>
                      <MaterialIcons name="check" size={16} color="#ffffff" />
                    </View>
                  ) : (
                    <View style={styles.checkboxEmpty} />
                  )}

                  <Text
                    style={[
                      styles.milestoneText,
                      milestone.completed && styles.milestoneTextCompleted,
                    ]}
                  >
                    {milestone.title}
                  </Text>

                  {/* Delete icon - only show when not completed */}
                  {!milestone.completed && (
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteMilestone(milestone.id, milestone.title)
                      }
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons
                        name="close"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyMilestones}>
              <MaterialIcons name="flag" size={40} color="#3f3f3f" />
              <Text style={styles.emptyMilestonesText}>
                No milestones yet. Tap + to add one.
              </Text>
            </View>
          )}
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
    paddingBottom: SPACING.xl * 2,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  efficiencyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  efficiencyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.orange + "15",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.orange + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.red + "15",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.red + "30",
    justifyContent: "center",
    alignItems: "center",
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
    lineHeight: 24,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  milestoneTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  milestonesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addMilestoneButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
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
  emptyMilestones: {
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyMilestonesText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.md,
  },
});

export default GoalDetail;
