import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, RelativePathString } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CustomGoalProps {
  id: number;
  title: string;
  description: string;
  deadline: string;
  efficiency: number;
  timeLogged: string;
  gradientColors: string[];
}

const CustomGoal = ({
  id,
  title,
  description,
  deadline,
  efficiency,
  timeLogged,
  gradientColors,
}: CustomGoalProps) => {
  return (
    <Link
      href={{
        pathname: "/goal-detail" as RelativePathString,
        params: { id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.goalCard} activeOpacity={0.7}>
        {/* Left Accent Bar */}
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />

        {/* Top Section: Title + Efficiency */}
        <View style={styles.topSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <Text style={styles.efficiency}>{efficiency}%</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={gradientColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${efficiency}%` }]}
          />
        </View>

        {/* Bottom Section: Deadline + Time Logged */}
        <View style={styles.bottomSection}>
          <View style={styles.infoItem}>
            <MaterialIcons
              name="calendar-today"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>{deadline}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons
              name="access-time"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>{timeLogged} logged</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    position: "relative",
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  efficiency: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.orange,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default CustomGoal;
