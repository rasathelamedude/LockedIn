import { COLORS, PRESET_COLORS, RADIUS, SPACING } from "@/constants/styles";
import { NewGoal } from "@/database/queries/goals";
import { useGoalStore } from "@/store/goalStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const EditGoal = () => {
  const { id } = useLocalSearchParams() as { id: string };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [daysFromNow, setDaysFromNow] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const getGoalWithId = useGoalStore((state) => state.getGoalWithId);
  const updateGoal = useGoalStore((state) => state.editGoal);
  const loading = useGoalStore((state) => state.loading);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await getGoalWithId(id);
        if (goal) {
          setTitle(goal.title);
          setDescription(goal.description || "");
          setTargetHours(goal.targetHours.toString());
          setColor(goal.color);

          // Calculate days from now if deadline exists
          if (goal.deadline) {
            const days = Math.max(
              0,
              Math.ceil(
                (new Date(goal.deadline).getTime() - Date.now()) / 86400000,
              ),
            );
            setDaysFromNow(days.toString());
          }
        }
      } catch (error) {
        Alert.alert("Error", "Could not load goal");
        router.back();
      }
    };

    loadGoal();
  }, [id, getGoalWithId]);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a goal title.");
      return;
    }

    const hours = parseFloat(targetHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert("Validation Error", "Please enter valid target hours.");
      return;
    }

    // Build updated goal
    const updates: Partial<NewGoal> = {
      title: title.trim(),
      description: description.trim() || null,
      targetHours: hours,
      color,
      deadline: null,
    };

    // Calculate deadline if provided
    if (daysFromNow.trim()) {
      const days = parseInt(daysFromNow, 10);
      if (!isNaN(days) && days > 0) {
        updates.deadline = new Date(Date.now() + days * 86400000);
      }
    }

    try {
      await updateGoal(id, updates);
      Toast.show({
        type: "success",
        text1: "Goal Updated!",
        text2: "Your changes have been saved.",
        position: "top",
        visibilityTime: 2000,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update goal. Please try again.");
      console.error("Error updating goal:", error);
    }
  };

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
          <Text style={styles.headerTitle}>Edit Goal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Complete DevOps Course"
            placeholderTextColor={COLORS.textSecondary}
            returnKeyType="next"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details about your goal..."
            placeholderTextColor={COLORS.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Target Hours Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Target Hours *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 50"
            placeholderTextColor={COLORS.textSecondary}
            value={targetHours}
            onChangeText={setTargetHours}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Days From Now */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Deadline (Days from now)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30 (optional)"
            placeholderTextColor={COLORS.textSecondary}
            value={daysFromNow}
            onChangeText={setDaysFromNow}
            keyboardType="number-pad"
          />
        </View>

        {/* Color Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Goal Color</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((presetColor) => (
              <TouchableOpacity
                key={presetColor}
                onPress={() => setColor(presetColor)}
                style={[
                  styles.colorOption,
                  color === presetColor && styles.colorOptionSelected,
                ]}
              >
                <View
                  style={[styles.colorCircle, { backgroundColor: presetColor }]}
                />
                {color === presetColor && (
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
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={loading}
      >
        <LinearGradient
          colors={[color, color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          <Text style={styles.submitText}>SAVE CHANGES</Text>
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

export default EditGoal;
