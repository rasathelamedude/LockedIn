import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Assistant = () => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ASSISTANT</Text>
            <Text style={styles.subtitle}>Your goal optimization partner</Text>
          </View>
          <MaterialIcons name="auto-awesome" size={24} color={COLORS.orange} />
        </View>

        {/* Empty State - Centered */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={40}
              color="#3f3f3f"
            />
          </View>
          <Text style={styles.emptyTitle}>Ask About Your Goals</Text>
          <Text style={styles.emptyDescription}>
            Get personalized guidance, break down complex goals, or ask for
            strategies to improve your efficiency.
          </Text>
        </View>

        {/* Chat Input - Fixed at Bottom */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={20}
            color={COLORS.textSecondary}
          />
          <TextInput
            style={styles.input}
            placeholder="Ask for help with your goals..."
            placeholderTextColor="#3f3f3f"
            multiline
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
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
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: SPACING.sm,
    marginBottom: "20%",
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 100,
  },
});

export default Assistant;
