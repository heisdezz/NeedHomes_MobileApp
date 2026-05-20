import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Colors } from "@/constants/theme";
import apiClient, { type ApiResponse } from "@/lib/api";
import tw from "@/lib/tw";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View
      style={[
        tw`rounded-2xl mb-3 overflow-hidden`,
        {
          borderWidth: 1,
          borderColor: isOpen ? Colors.brand : Colors.divider,
          backgroundColor: isOpen ? Colors.brand + "08" : "#fff",
        },
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={tw`flex-row items-center justify-between px-4 py-4`}
      >
        <Text
          style={[
            tw`text-sm font-semibold flex-1 pr-3 leading-5`,
            { color: isOpen ? Colors.brand : Colors.textPrimary },
          ]}
        >
          {item.question}
        </Text>
        <View
          style={[
            tw`w-7 h-7 rounded-full items-center justify-center`,
            { backgroundColor: isOpen ? Colors.brand : "#F3F4F6" },
          ]}
        >
          <Ionicons
            name={isOpen ? "remove" : "add"}
            size={16}
            color={isOpen ? "#fff" : Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            tw`px-4 pb-4`,
            { borderTopWidth: 1, borderTopColor: Colors.brand + "20" },
          ]}
        >
          <Text
            style={[
              tw`text-sm leading-6 pt-3`,
              { color: Colors.textSecondary },
            ]}
          >
            {item.answer}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const { data, isLoading } = useQuery<ApiResponse<FAQ[]>>({
    queryKey: ["faqs-public"],
    queryFn: async () => {
      const resp = await apiClient.get("faqs");
      return resp.data;
    },
  });

  const faqs: FAQ[] = (data?.data as any) ?? [];

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#fff" }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center px-4 py-3 border-b`,
          { borderBottomColor: Colors.divider },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={[tw`text-lg font-bold flex-1`, { color: Colors.textPrimary }]}
        >
          FAQs
        </Text>
      </View>

      {/* Hero strip */}
      <View style={[tw`px-5 py-6`, { backgroundColor: "#333D42" }]}>
        <Text style={tw`text-3xl font-bold text-white mb-1`}>
          FAQs<Text style={{ color: Colors.brand }}>.</Text>
        </Text>
        <Text style={[tw`text-sm`, { color: "rgba(255,255,255,0.6)" }]}>
          Find answers to frequently asked questions.
        </Text>

        {/* Search */}
        <View
          style={[
            tw`flex-row items-center rounded-xl px-4 mt-4`,
            {
              backgroundColor: "rgba(255,255,255,0.12)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color="rgba(255,255,255,0.6)"
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search questions…"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={[tw`flex-1 py-3 ml-2 text-sm`, { color: "#fff" }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FAQ list */}
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-4 py-5 pb-12`}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.brand} style={tw`py-16`} />
        ) : filtered.length === 0 ? (
          <View style={tw`items-center py-16`}>
            <Ionicons
              name="help-circle-outline"
              size={48}
              color={Colors.textMuted}
            />
            <Text style={[tw`text-sm mt-3`, { color: Colors.textMuted }]}>
              {search ? "No results found." : "No FAQs available."}
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openIndex === idx}
              onToggle={() => toggle(idx)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
