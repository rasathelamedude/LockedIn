import { COLORS, PRESET_COLORS, RADIUS, SPACING } from "@/constants/styles";
import { NewGoal } from "@/database/queries/goals";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [daysFromNow, setDaysFromNow] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const addGoal = useGoalStore((state) => state.addGoal);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Please enter a goal title.");
      return;
    }

    const hours = parseFloat(targetHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert("Please enter a valid positive number for target hours.");
      return;
    }

    const newGoal: NewGoal = {
      title,
      description,
      targetHours: Number(targetHours),
      deadline: null,
      color: selectedColor,
    };

    if (daysFromNow.trim()) {
      const days = parseFloat(daysFromNow);
      if (!isNaN(days) && days > 0) {
        newGoal.deadline = new Date(Date.now() + days * 86400000);
      }
    }

    try {
      await addGoal(newGoal);
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
            value={title}
            onChangeText={(text) => setTitle(text)}
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
            onChangeText={(text) => setDescription(text)}
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
            value={targetHours.toString()}
            onChangeText={(hours) => setTargetHours(hours)}
            keyboardType="numeric"
          />
        </View>

        {/* Days From Now */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Deadline (Days from now)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30 (optional)"
            placeholderTextColor={COLORS.textSecondary}
            value={daysFromNow.toString()}
            onChangeText={(days) => setDaysFromNow(days)}
            keyboardType="number-pad"
          />
        </View>

        {/* Color Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Goal Color</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorOption,
                  selectedColor === color && styles.colorOptionSelected,
                ]}
              >
                <View
                  style={[styles.colorCircle, { backgroundColor: color }]}
                />
                {selectedColor === color && (
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
      >
        <LinearGradient
          colors={[
            selectedColor || PRESET_COLORS[0],
            selectedColor || PRESET_COLORS[0],
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
