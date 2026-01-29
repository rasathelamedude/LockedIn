import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

const ChatBubble = ({ role, content, timestamp }: ChatBubbleProps) => {
  const isUser = role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="psychology" size={16} color={COLORS.orange} />
          </View>
        </View>
      )}

      {/* Message bubble */}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.message,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          {content}
        </Text>
      </View>

      {/* Spacer for user messages to push them right */}
      {isUser && <View style={styles.spacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: SPACING.md,
    alignItems: "flex-end",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  assistantContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: SPACING.xs,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.orange + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    backgroundColor: COLORS.orange,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessage: {
    color: "#ffffff",
  },
  assistantMessage: {
    color: COLORS.text,
  },
  spacer: {
    width: 40,
  },
});

export default ChatBubble;
