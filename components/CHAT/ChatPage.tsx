import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { type ApiResponse } from "@/lib/api";
import { useSocketStore } from "@/store/socket-store";
import { toast } from "sonner-native";
import Conversations from "./Conversations";
import ChatInputBar from "./ChatInputBar";
import type { Conversation } from "@/types/chat";
import tw from "twrnc";
import { Colors } from "@/constants/theme";
import PageLoader from "../layout/PageLoader";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { connect, disconnect, isConnected, emit } = useSocketStore();
  const [isClosed, setIsClosed] = useState(false);

  // Fetch conversation
  const query = useQuery<ApiResponse<Conversation>>({
    queryKey: ["chat"],
    queryFn: async () => {
      const resp = await apiClient.get("/chat/my-conversation");
      return resp.data;
    },
  });

  const conversation = query.data?.data;

  // Update closed state
  useEffect(() => {
    if (conversation?.status === "CLOSED") {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  }, [conversation?.status]);

  // Connect socket on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  // Join conversation when connected
  useEffect(() => {
    if (isConnected && conversation?.id) {
      emit("chat:createConversation", {
        conversationId: conversation.id,
      });
    }
  }, [isConnected, conversation?.id]);

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (message: string) => {
      const resp = await apiClient.post("/chat/conversations", { message });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      toast.success("Conversation started");
    },
    onError: () => {
      toast.error("Failed to start conversation");
    },
  });

  // Loading state

  // No conversation state
  if (!conversation) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white dark:bg-gray-900`}>
        {/* Header */}
        <View
          style={tw`px-6 py-4 border-b border-gray-200 dark:border-gray-700`}
        >
          <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white`}>
            Chat
          </Text>
        </View>

        {/* Empty State */}
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <View
            style={[
              tw`rounded-full w-20 h-20 items-center justify-center mb-4`,
              { backgroundColor: Colors.brand + "20" },
            ]}
          >
            <Text style={tw`text-4xl`}>💬</Text>
          </View>
          <Text
            style={tw`text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2`}
          >
            No Messages
          </Text>
          <Text style={tw`text-gray-600 dark:text-gray-400 text-center mb-6`}>
            Start a conversation with our support team
          </Text>
          <TouchableOpacity
            disabled={startConversationMutation.isPending}
            onPress={() => startConversationMutation.mutate("Hello")}
            style={[
              tw`px-8 py-4 rounded-full shadow-lg ${
                startConversationMutation.isPending ? "opacity-50" : ""
              }`,
              { backgroundColor: Colors.brand },
            ]}
          >
            {startConversationMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-lg`}>
                Start Conversation
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Chat view
  return (
    <KeyboardProvider>
      <PageLoader query={query}>
        {(data) => {
          return (
            <SafeAreaView style={tw`flex-1 bg-white dark:bg-gray-900`}>
              {/* Header */}
              <View
                style={tw`px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between`}
              >
                <Text
                  style={tw`text-2xl font-bold text-gray-900 dark:text-white`}
                >
                  Chat
                </Text>

                {/* Connection Status */}
                <View style={tw`flex-row items-center`}>
                  <View
                    style={tw`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    } mr-2`}
                  />
                  <Text style={tw`text-xs text-gray-600 dark:text-gray-400`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Text>
                </View>
              </View>

              {/* Messages */}
              <Conversations
                conversation={conversation}
                onRefetch={query.refetch}
              />

              {/* Input Bar */}
              <ChatInputBar conversation={conversation} isClosed={isClosed} />
            </SafeAreaView>
          );
        }}
      </PageLoader>
    </KeyboardProvider>
  );
}
