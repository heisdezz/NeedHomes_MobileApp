import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useSocketStore } from "@/store/socket-store";
import { uploadImage } from "@/lib/imageApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { toast } from "sonner-native";
import * as ImagePicker from "expo-image-picker";
import tw from "@/lib/tw";
import type { Conversation } from "@/types/chat";

interface ChatInputBarProps {
  conversation: Conversation | null;
  isClosed?: boolean;
}

export default function ChatInputBar({
  conversation,
  isClosed,
}: ChatInputBarProps) {
  const [message, setMessage] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const { emit } = useSocketStore();

  // Mutation for starting a new conversation
  const startConversationMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      const resp = await apiClient.post("/chat/conversations", {
        message: data.message,
      });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
    onError: () => {
      toast.error("Failed to start conversation");
    },
  });

  // Mutation for uploading images
  const uploadImageMutation = useMutation({
    mutationFn: async (uri: string) => {
      return await uploadImage(uri);
    },
    onSuccess: async (data) => {
      // Send the uploaded image URL as a message
      await sendMessageMutation.mutateAsync(data.data.url);
      clearImage();
    },
    onError: () => {
      toast.error("Failed to upload image");
    },
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (conversation) {
        // Send via socket for existing conversation
        return new Promise((resolve, reject) => {
          try {
            emit("chat:sendMessage", {
              conversationId: conversation.id,
              content,
            });
            resolve({ success: true });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        // Create new conversation via API
        return await startConversationMutation.mutateAsync({
          message: content,
        });
      }
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const emitTyping = (isTyping: boolean) => {
    if (!conversation?.id) return;
    emit("chat:typing", { conversationId: conversation.id, isTyping });
  };

  const handleTextChange = (text: string) => {
    setMessage(text);
    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      toast.error("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
    }
  };

  const clearImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    const text = message.trim();

    if (!imageUri && !text) {
      toast.info("Message is empty");
      return;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(false);

    // Upload image if present
    if (imageUri) {
      await uploadImageMutation.mutateAsync(imageUri);
    }

    // Send text message if present
    if (text) {
      await sendMessageMutation.mutateAsync(text);
      setMessage("");
    }
  };

  // Check if any operation is in progress
  const isLoading =
    uploadImageMutation.isPending ||
    sendMessageMutation.isPending ||
    startConversationMutation.isPending;

  if (isClosed) {
    return (
      <View
        style={tw`bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-300 dark:border-gray-700`}
      >
        <Text style={tw`text-center text-sm text-gray-500`}>
          This conversation has been closed.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
      style={tw`bg-white dark:bg-gray-800`}
    >
      <View
        style={tw`bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700`}
      >
        {/* Image Preview */}
        {imageUri && (
          <View style={tw`p-3 border-b border-gray-200 dark:border-gray-700`}>
            <View style={tw`relative inline-block`}>
              <Image
                source={{ uri: imageUri }}
                style={tw`w-20 h-20 rounded-lg`}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={clearImage}
                disabled={uploadImageMutation.isPending}
                style={tw`absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center ${
                  uploadImageMutation.isPending ? "opacity-50" : ""
                }`}
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View style={tw`flex-row  items-center p-3 gap-2`}>
          {/* Image Button */}
          <TouchableOpacity
            onPress={pickImage}
            disabled={isLoading}
            style={tw`p-2`}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={isLoading ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={tw`flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-gray-900 dark:text-white`}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={tw`bg-brand rounded-full w-10 h-10 items-center justify-center ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
