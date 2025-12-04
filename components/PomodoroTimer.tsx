import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PomodoroTimer = ({ gradientColors }: { gradientColors: string[] }) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }

          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, secondsLeft]);

  const startFocus = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(25 * 60);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <View style={styles.timerCard}>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerDisplay}>{secondsLeft}</Text>
        <Text style={styles.label}>FOCUS SESSIOn</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={startFocus}
          style={styles.button}
        >
          <LinearGradient
            colors={
              isRunning
                ? ["#374151", "#1f2937"]
                : (gradientColors as [string, string])
            }
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

        {secondsLeft !== 25 * 60 && (
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
    letterSpacing: 2,
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
