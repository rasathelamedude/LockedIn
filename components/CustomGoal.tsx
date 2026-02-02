import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function formatDeadline(deadline: Date | null) {
  if (!deadline) return { text: "No deadline", urgent: false };

  const date = new Date(deadline);
  const today = new Date();

  const daysLeft = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysLeft < 0) return { text: "Overdue!", urgent: true };
  if (daysLeft === 0) return { text: "Due Today!", urgent: true };
  if (daysLeft === 1) return { text: "Due Tomorrow", urgent: true };
  if (daysLeft <= 3) return { text: `${daysLeft} days left`, urgent: true };

  return { text: `${daysLeft} days left`, urgent: false };
}

function getStatusInfo(efficiency: number | null) {
  if (!efficiency || efficiency === 0) {
    return {
      color: COLORS.textSecondary,
      bgColor: COLORS.textSecondary + "20",
      text: "Not Started",
      icon: "hourglass-empty" as const,
    };
  }
  if (efficiency >= 90) {
    return {
      color: COLORS.green,
      bgColor: COLORS.green + "20",
      text: "On Track",
      icon: "check-circle" as const,
    };
  }
  if (efficiency >= 70) {
    return {
      color: COLORS.orange,
      bgColor: COLORS.orange + "20",
      text: "At Risk",
      icon: "warning" as const,
    };
  }
  return {
    color: COLORS.red,
    bgColor: COLORS.red + "20",
    text: "Behind",
    icon: "error" as const,
  };
}

interface CustomGoalProps {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  efficiency: number | null;
  hoursLogged: number;
  targetHours: number;
  color: string;
}

const CustomGoal = ({
  id,
  title,
  description,
  deadline,
  efficiency,
  hoursLogged,
  targetHours,
  color,
}: CustomGoalProps) => {
  const progress = Math.min(100, Math.round((hoursLogged / targetHours) * 100));
  const deadlineInfo = formatDeadline(deadline);
  const statusInfo = getStatusInfo(efficiency);

  return (
    <TouchableOpacity
      style={styles.goalCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/goal/${id}`)}
    >
      {/* Subtle Background Glow */}
      <View
        style={[
          styles.backgroundGlow,
          { backgroundColor: color + "15" }, // 15 = very transparent
        ]}
      />

      {/* Strong Left Accent Bar with Glow */}
      <LinearGradient
        colors={[color, color + "CC"]} // CC = 80% opacity
        style={styles.accentBar}
      />

      {/* Content Container with Dark Overlay for Contrast */}
      <View style={styles.darkOverlay} />

      <View style={styles.contentContainer}>
        {/* Top Row: Status Badge + Efficiency */}
        <View style={styles.topRow}>
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.bgColor },
            ]}
          >
            <MaterialIcons
              name={statusInfo.icon}
              size={14}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>

          {/* Efficiency Percentage - Large and Prominent */}
          <View style={styles.efficiencyContainer}>
            <Text style={[styles.efficiencyNumber, { color }]}>
              {efficiency?.toFixed(1) ?? 0}
            </Text>
            <Text style={styles.efficiencyPercent}>%</Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        {/* Progress Bar - Glowing */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            {/* Background Track */}
            <View style={styles.progressBarTrack} />
            {/* Filled Progress with Glow */}
            <LinearGradient
              colors={[color + "DD", color]} // DD = 87% opacity to full
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                },
              ]}
            />
          </View>

          {/* Progress Text */}
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              <Text style={styles.progressBold}>{hoursLogged.toFixed(1)}</Text>
              {" / "}
              <Text style={styles.progressTarget}>{targetHours} hrs</Text>
            </Text>
          </View>
        </View>

        {/* Bottom Row: Deadline + Remaining */}
        <View style={styles.bottomRow}>
          {/* Deadline */}
          <View style={styles.infoItem}>
            <MaterialIcons
              name="event"
              size={16}
              color={deadlineInfo.urgent ? COLORS.red : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.infoText,
                deadlineInfo.urgent && styles.urgentText,
              ]}
            >
              {deadlineInfo.text}
            </Text>
          </View>

          {/* Hours Remaining */}
          <View style={styles.infoItem}>
            <MaterialIcons
              name="timer"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>
              {Math.max(0, targetHours - hoursLogged).toFixed(1)} hrs left
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    position: "relative",
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    minHeight: 150,
    // Card shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  backgroundGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  darkOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingLeft: SPACING.lg + 10,
    position: "relative",
    zIndex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  efficiencyContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  efficiencyNumber: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  efficiencyPercent: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 2,
  },
  titleSection: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    width: "100%",
    height: 12,
    position: "relative",
    marginBottom: SPACING.xs,
  },
  progressBarTrack: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  progressBarFill: {
    position: "absolute",
    height: "100%",
    borderRadius: RADIUS.sm,
    elevation: 2,
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressBold: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  progressTarget: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bottomRow: {
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
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  urgentText: {
    color: COLORS.red,
    fontWeight: "700",
  },
});

export default CustomGoal;
