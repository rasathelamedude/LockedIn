import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { useAgentStore } from "@/store/useAgentStore";
import { Message } from "@/types/agent";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const Assistant = () => {
  const [isFocused, setIsFocused] = useState(false);
  const messageRef = useRef<string>("");
  const inputRef = useRef<TextInput>(null);

  const { messages, loading, addMessage } = useAgentStore();

  const handleSend = () => {
    const message = messageRef.current.trim();

    // Check if message is empty
    if (message.length === 0) return;

    // Construct user message
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: Date.now() as number,
    };

    // Add user message to store
    addMessage(userMessage);

    // Clear input refs
    messageRef.current = "";
    if (inputRef.current) {
      inputRef.current.clear();
    }

    // Dismiss keyboard
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>ASSISTANT</Text>
                <Text style={styles.subtitle}>
                  Your goal optimization partner
                </Text>
              </View>
              <MaterialIcons
                name="auto-awesome"
                size={24}
                color={COLORS.orange}
              />
            </View>

            {/* Empty State - Only show when not focused */}
            {!isFocused && (
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
                  Get personalized guidance, break down complex goals, or ask
                  for strategies to improve your efficiency.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Chat Messages */}
          {messages.length > 0 && (
            <View style={styles.messagesList}>
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.role === "user"
                      ? styles.userMessage
                      : styles.agentMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.content}</Text>
                </View>
              ))}
              {loading && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
            </View>
          )}

          {/* Chat Input - At bottom of KeyboardAvoidingView */}
          <View style={styles.inputWrapper}>
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
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmitEditing={Keyboard.dismiss}
                ref={inputRef}
                onChangeText={(text) => (messageRef.current = text)}
                value={messageRef.current}
                autoCorrect={true}
                spellCheck={true}
              />
              {/* Send Button */}
              <TouchableOpacity
                style={styles.sendButton}
                activeOpacity={0.7}
                onPress={handleSend}
                disabled={loading}
              >
                <MaterialIcons name="arrow-upward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    minHeight: 400,
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
  inputWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 100, // Space for tab bar
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: SPACING.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
    gap: SPACING.md,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.orange,
  },
  agentMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 15,
  },
});

export default Assistant;
