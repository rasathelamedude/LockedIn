import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { getAllActiveGoals, Goal } from "@/database/queries/goals";
import { useTimerStore } from "@/store/timerStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Timer = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const isRunning = useTimerStore((state) => state.isRunning);
  const timeRemaining = useTimerStore((state) => state.timeRemaining);
  const loading = useTimerStore((state) => state.loading);
  const sessionId = useTimerStore((state) => state.sessionId);
  const goalId = useTimerStore((state) => state.goalId);
  const startTimer = useTimerStore((state) => state.startTimer);
  const completeTimer = useTimerStore((state) => state.completeTimer);
  const cancelTimer = useTimerStore((state) => state.cancelTimer);
  const tick = useTimerStore((state) => state.tick);
  const stopTick = useTimerStore((state) => state.stopTick);

  useFocusEffect(
    useCallback(() => {
      const fetchGoals = async () => {
        const activeGoals = await getAllActiveGoals();
        setGoals(activeGoals);

        if (activeGoals.length > 0 && !selectedGoalId) {
          setSelectedGoalId(activeGoals[0].id);
        }
      };
      fetchGoals();
    }, [selectedGoalId]),
  );

  useEffect(() => {
    if (isRunning) {
      tick();
    }
  }, [isRunning, tick]);

  useEffect(() => {
    if (isRunning && timeRemaining === 0) {
      completeTimer();
      Alert.alert(
        "Session Complete!",
        "Great job! Your focus session is logged.",
      );
    }
  }, [completeTimer, isRunning, timeRemaining]);

  const handleStartTimer = useCallback(async () => {
    if (!selectedGoalId) {
      Alert.alert("Please select a goal to focus on.");
      return;
    }

    try {
      await startTimer(selectedGoalId!);
    } catch (error) {
      console.error("Error starting timer:", error);
      Alert.alert("Error starting timer. Please try again.");
    }
  }, [startTimer, selectedGoalId]);

  const handleCancelTimer = useCallback(async () => {
    Alert.alert(
      "Cancel Session?",
      "This will discard your progress for this session.",
      [
        { text: "Keep Going", style: "cancel" },
        {
          text: "Cancel Session",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelTimer();
            } catch (error) {
              Alert.alert("Error", "Could not cancel session");
            }
          },
        },
      ]
    );
  }, [cancelTimer]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const activeGoal = goals.find(
    (goal) => goal.id === (goalId || selectedGoalId),
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
            <Text style={styles.title}>TIMER</Text>
            <Text style={styles.subtitle}>FOCUSED WORK SESSION</Text>
          </View>
          <MaterialIcons name="timer" size={24} color={COLORS.orange} />
        </View>

        {/* Timer Display */}
        <View style={styles.timerCard}>
          <Text style={styles.timeText}>{timeDisplay}</Text>
          <Text style={styles.label}>
            {isRunning ? "SESSION IN PROGRESS" : "READY TO FOCUS"}
          </Text>

          {activeGoal && (
            <View style={styles.goalBadge}>
              <MaterialIcons
                name="flag"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.goalBadgeText}>{activeGoal.title}</Text>
            </View>
          )}
        </View>

        {/* Goal Selection - Only show if not running */}
        {!isRunning && goals.length > 0 && (
          <View style={styles.goalSelection}>
            <Text style={styles.sectionTitle}>Select Goal</Text>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => setSelectedGoalId(goal.id)}
                style={[
                  styles.goalOption,
                  selectedGoalId === goal.id && styles.goalOptionSelected,
                ]}
              >
                <View
                  style={[styles.goalColorDot, { backgroundColor: goal.color }]}
                />
                <Text style={styles.goalOptionText}>{goal.title}</Text>
                {selectedGoalId === goal.id && (
                  <MaterialIcons name="check" size={20} color={COLORS.orange} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Goals State */}
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="flag" size={40} color="#3f3f3f" />
            <Text style={styles.emptyText}>
              Create a goal first to start tracking your focus time.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleStartTimer}
            activeOpacity={0.8}
            disabled={loading || goals.length === 0}
          >
            <LinearGradient
              colors={[COLORS.orange, COLORS.orangeDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <MaterialIcons name="play-arrow" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>START FOCUS</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelTimer}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={20} color={COLORS.red} />
            <Text style={styles.cancelButtonText}>Cancel Session</Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingBottom: 120,
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
  timerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  timeText: {
    fontSize: 72,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  goalBadgeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  goalSelection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  goalOptionSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.cardBg,
  },
  goalColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  goalOptionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  buttonContainer: {
    position: "absolute",
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  button: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Timer;
