import ChatBubble from "@/components/ChatBubble";
import { COLORS, RADIUS, SPACING } from "@/constants/styles";
import { Message, useAssistantStore } from "@/store/assistantStore";
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
  View,
} from "react-native";

const Assistant = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, loading, addMessage } = useAssistantStore();

  const handleSend = async () => {
    const message = inputText.trim();
    if (message.length === 0) return;

    // Construct user message
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    // Clear input
    setInputText("");
    Keyboard.dismiss();

    // Add user message to store
    await addMessage(userMessage);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -60 : 0}
    >
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ASSISTANT</Text>
            <Text style={styles.subtitle}>Your goal optimization partner</Text>
          </View>
          <MaterialIcons name="auto-awesome" size={24} color={COLORS.orange} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.length === 0 ? (
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
          ) : (
            <>
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  role={msg.role as "user" | "assistant"}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              {loading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <MaterialIcons
                        name="psychology"
                        size={16}
                        color={COLORS.orange}
                      />
                    </View>
                  </View>
                  <View style={styles.loadingBubble}>
                    <View style={styles.typingIndicator}>
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask for help with your goals..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              maxLength={2000}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={loading || !inputText.trim()}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="arrow-upward"
                size={20}
                color={inputText.trim() ? "#ffffff" : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
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
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexGrow: 1,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: SPACING.md,
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
  loadingBubble: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  typingIndicator: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  inputWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 100,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: SPACING.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
});

export default Assistant;
