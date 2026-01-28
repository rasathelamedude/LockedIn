import { COLORS, PRESET_COLORS, RADIUS, SPACING } from "@/constants/styles";
import { Goal } from "@/database/queries/goals";
import { useGoalStore } from "@/store/goalStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CreateGoalPage = () => {
  const [goal, setGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    targetHours: 0,
    color: PRESET_COLORS[0],
  });

  const addGoal = useGoalStore((state) => state.addGoal);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);

  const handleSubmit = async (goal: Goal) => {
    if (!goal.title.trim()) {
      Alert.alert("Please enter a goal title.");
      return;
    }

    if (!goal.targetHours || goal.targetHours <= 0) {
      Alert.alert("Please enter the number of hours for the goal.");
      return;
    }

    if (isNaN(Number(goal.targetHours)) || Number(goal.targetHours) <= 0) {
      Alert.alert("Please enter a valid positive number for target hours.");
      return;
    }

    try {
      await addGoal(goal);
      Alert.alert("Goal created successfully!");
    } catch (error) {
      Alert.alert("Error creating goal. Please try again.");
      console.error("Error creating goal:", error);
      return;
    }

    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.red }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Goal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Complete DevOps Course"
            placeholderTextColor={COLORS.textSecondary}
            returnKeyType="done"
            value={goal.title}
            onChangeText={(text) => setGoal({ ...goal, title: text })}
          />
        </View>

        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details about your goal..."
            placeholderTextColor={COLORS.textSecondary}
            value={goal.description || ""}
            onChangeText={(text) => setGoal({ ...goal, description: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Target Hours Inputs */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Target Hours *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 50"
            placeholderTextColor={COLORS.textSecondary}
            value={goal.targetHours ? goal.targetHours.toString() : ""}
            onChangeText={(text) => {
              const hours = Number(text);
              setGoal({ ...goal, targetHours: hours });
            }}
            keyboardType="numeric"
          />
        </View>

        {/* Days From Now */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Deadline (Days from now) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30"
            placeholderTextColor={COLORS.textSecondary}
            value={goal.deadline ? goal.deadline.toString() : ""}
            onChangeText={(days) => {
              const daysNum = Number(days);
              const deadline =
                daysNum > 0 ? new Date(Date.now() + daysNum * 86400000) : null;
              setGoal({ ...goal, deadline });
            }}
            keyboardType="numeric"
          />
        </View>

        {/* Color Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Goal Color</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setGoal({ ...goal, color })}
                style={[
                  styles.colorOption,
                  goal.color === color && styles.colorOptionSelected,
                ]}
              >
                <View
                  style={[styles.colorCircle, { backgroundColor: color }]}
                />
                {goal.color === color && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color="#ffffff"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() =>
          handleSubmit({
            title: goal.title || "",
            description: goal.description || null,
            deadline: goal.deadline || null,
            color: goal.color || PRESET_COLORS[0],
            efficiency: goal.efficiency || null,
            hoursLogged: 0,
            targetHours: goal.targetHours || 0,
          } as Goal)
        }
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[
            goal.color || PRESET_COLORS[0],
            goal.color || PRESET_COLORS[0],
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          <Text style={styles.submitText}>CREATE GOAL</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    position: "relative",
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
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: COLORS.text,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  checkIcon: {
    position: "absolute",
  },
  submitButton: {
    position: "absolute",
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  submitGradient: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default CreateGoalPage;
