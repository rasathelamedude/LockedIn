import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PomodoroTimerProps {
  gradientColors: [string, string];
}

const PomodoroTimer = ({ gradientColors }: PomodoroTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval if running
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false); // Auto-stop when timer reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, secondsLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(25 * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Format time as MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // Determine if timer has been used
  const hasStarted = secondsLeft !== 25 * 60;

  return (
    <View style={styles.timerCard}>
      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{timeDisplay}</Text>
        <Text style={styles.label}>FOCUS SESSION</Text>
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        {/* Start/Pause Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={toggleTimer}
          activeOpacity={0.8}
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
              {isRunning ? "PAUSE SESSION" : "START FOCUS"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reset Button - Only show if timer has been started */}
        {hasStarted && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetTimer}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="refresh"
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
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
