import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { useTimerStore } from "@/store/timerStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface PomodoroTimerProps {
  gradientColors: [string, string];
  goalId: string;
}

const PomodoroTimer = ({ gradientColors, goalId }: PomodoroTimerProps) => {
  const isRunning = useTimerStore((state) => state.isRunning);
  const timeRemaining = useTimerStore((state) => state.timeRemaining);
  const loading = useTimerStore((state) => state.loading);

  const startTimer = useTimerStore((state) => state.startTimer);
  const completeTimer = useTimerStore((state) => state.completeTimer);
  const cancelTimer = useTimerStore((state) => state.cancelTimer);
  const stopTick = useTimerStore((state) => state.stopTick);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);

  const toggleTimer = async () => {
    if (!isRunning && timeRemaining === 25 * 60) {
      // Start timer
      try {
        await startTimer(goalId);
      } catch (error) {
        Alert.alert("Error starting timer. Please try again.");
      }
    } else if (!isRunning && timeRemaining !== 25 * 60) {
      // Resume timer
      resumeTimer();
    } else {
      // Pause timer
      stopTick();
    }
  };

  const handleComplete = async () => {
    Alert.alert("Complete Session?", "Mark this focus session as complete.", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "Complete Session",
        style: "default",
        onPress: async () => {
          try {
            await completeTimer();
            Toast.show({
              type: "success",
              text1: "Session Completed",
              text2: "Great work! Your session has been saved.",
              position: "top",
              visibilityTime: 3000,
            });
          } catch (error) {
            Alert.alert("Error", "Could not complete session");
          }
        },
      },
    ]);
  };

  const handleCancel = async () => {
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
              Toast.show({
                type: "info",
                text1: "Session Cancelled",
                text2: "Your session has been successfully cancelled.",
                position: "top",
                visibilityTime: 3000,
              });
            } catch (error) {
              Alert.alert("Error", "Could not cancel session");
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    if (isRunning && timeRemaining === 0) {
      completeTimer();
    }
  }, [completeTimer, isRunning, timeRemaining]);

  // Format time as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <View style={styles.timerCard}>
      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{timeDisplay}</Text>
        <Text style={styles.label}>FOCUS SESSION</Text>
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        {/* Start/Resume/Pause Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={toggleTimer}
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={isRunning ? ["#374151", "#1f2937"] : gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <MaterialIcons
              name={isRunning ? "pause" : "play-arrow"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.buttonText}>
              {isRunning ? "PAUSE" : "START FOCUS"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Complete and Cancel Buttons - Show when paused */}
        {!isRunning && timeRemaining !== 25 * 60 && (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="check-circle"
                size={20}
                color={COLORS.green}
              />
              <Text style={[styles.actionText, { color: COLORS.green }]}>
                Complete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color={COLORS.red} />
              <Text style={[styles.actionText, { color: COLORS.red }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  timerDisplay: {
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
  },
  buttonContainer: {
    gap: SPACING.sm,
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
  actionButtonContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  resetText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PomodoroTimer;
