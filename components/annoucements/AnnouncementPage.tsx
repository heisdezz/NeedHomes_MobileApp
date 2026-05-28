import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import apiClient from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import PageLoader from "@/components/layout/PageLoader";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: "ALL_USERS" | "INVESTORS" | "PARTNERS";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isRead: boolean;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Time";
  }
}

function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  } catch {
    return formatDate(dateString);
  }
}

// ─── Announcement Card Component ──────────────────────────────────────────

function AnnouncementCard({
  announcement,
  onPress,
}: {
  announcement: Announcement;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        tw`p-4 rounded-2xl mb-3 flex-row gap-3`,
        {
          backgroundColor: announcement.isRead ? "#fff" : "#FEF3C7",
          borderWidth: 1,
          borderColor: announcement.isRead ? Colors.divider : "#FBBF24",
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          tw`w-12 h-12 rounded-full items-center justify-center shrink-0`,
          { backgroundColor: announcement.isRead ? Colors.inputBg : "#FEF3C7" },
        ]}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={announcement.isRead ? Colors.textMuted : "#D97706"}
        />
      </View>

      {/* Content */}
      <View style={tw`flex-1`}>
        {/* Date and Time */}
        <View style={tw`flex-row items-center gap-2 mb-1`}>
          <Text
            style={[tw`text-xs`, { color: Colors.textSecondary }]}
          >
            {formatDate(announcement.createdAt)}
          </Text>
          <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>•</Text>
          <Text
            style={[tw`text-xs`, { color: Colors.textSecondary }]}
          >
            {getTimeAgo(announcement.createdAt)}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={[
            tw`text-sm font-bold mb-1`,
            { color: Colors.textPrimary },
          ]}
          numberOfLines={1}
        >
          {announcement.title || "Update"}
        </Text>

        {/* Preview */}
        <Text
          style={[tw`text-xs`, { color: Colors.textSecondary }]}
          numberOfLines={2}
        >
          {announcement.content.replace(/<[^>]*>/g, "")}
        </Text>
      </View>

      {/* Unread Indicator & Chevron */}
      <View style={tw`shrink-0 items-center justify-center gap-2`}>
        {!announcement.isRead && (
          <View
            style={[
              tw`w-2 h-2 rounded-full`,
              { backgroundColor: Colors.brand },
            ]}
          />
        )}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────

function AnnouncementDetail({
  announcement,
  visible,
  onClose,
}: {
  announcement: Announcement | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!announcement) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}>
        {/* Header */}
        <View
          style={[
            tw`flex-row items-center justify-between px-4 py-3 bg-white border-b`,
            { borderBottomColor: Colors.divider },
          ]}
        >
          <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
            Announcement
          </Text>
          <TouchableOpacity onPress={onClose} style={tw`p-2 -mr-2`}>
            <Ionicons
              name="close-circle"
              size={28}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={[announcement]}
          scrollEnabled
          contentContainerStyle={tw`flex-grow p-4`}
          renderItem={() => (
            <View style={tw`bg-white rounded-2xl p-5`}>
              {/* Date & Time */}
              <View style={tw`flex-row gap-4 mb-4`}>
                <View style={tw`flex-row items-center gap-1`}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={Colors.textMuted}
                  />
                  <Text
                    style={[tw`text-xs`, { color: Colors.textSecondary }]}
                  >
                    {formatDate(announcement.createdAt)}
                  </Text>
                </View>
                <View style={tw`flex-row items-center gap-1`}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={Colors.textMuted}
                  />
                  <Text
                    style={[tw`text-xs`, { color: Colors.textSecondary }]}
                  >
                    {formatTime(announcement.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text
                style={[
                  tw`text-2xl font-bold mb-4`,
                  { color: Colors.textPrimary },
                ]}
              >
                {announcement.title}
              </Text>

              {/* Content */}
              <Text
                style={[tw`text-base leading-6`, { color: Colors.textSecondary }]}
              >
                {announcement.content.replace(/<[^>]*>/g, "")}
              </Text>
            </View>
          )}
          ListFooterComponent={<View style={tw`h-20`} />}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

interface AnnouncementPageProps {
  userType: "investor" | "partner";
}

export default function AnnouncementsPage({
  userType,
}: AnnouncementPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const query = useQuery<Announcement[]>({
    queryKey: [`announcements-${userType}`],
    queryFn: async () => {
      const resp = await apiClient.get("/announcements/mine");
      return resp.data?.data?.data ?? [];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/announcements/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`announcements-${userType}`],
      });
    },
  });

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setModalVisible(true);
    if (!announcement.isRead) {
      markAsReadMutation.mutate(announcement.id);
    }
  };

  const announcements: Announcement[] = Array.isArray(query.data) ? query.data : [];
  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View
        style={[
          tw`px-4 py-3 bg-white border-b flex-row items-center gap-3`,
          { borderBottomColor: Colors.divider },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2 -ml-2`}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <View style={tw`flex-1`}>
          <Text
            style={[tw`text-xl font-bold`, { color: Colors.textPrimary }]}
          >
            Announcements
          </Text>
          <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
            {announcements.length} {announcements.length === 1 ? "update" : "updates"}
            {unreadCount > 0 && ` • ${unreadCount} new`}
          </Text>
        </View>
        <View
          style={[tw`p-2 rounded-lg`, { backgroundColor: Colors.inputBg }]}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={Colors.brand}
          />
        </View>
      </View>

      {/* Content */}
      <View style={tw`flex-1 px-4 pt-4`}>
        <PageLoader query={query} loadingText="Loading announcements...">
          {(data) => {
            if (data.length === 0) {
              return (
                <View style={tw`flex-1 items-center justify-center`}>
                  <View
                    style={[
                      tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
                      { backgroundColor: Colors.inputBg },
                    ]}
                  >
                    <Ionicons
                      name="notifications-off-outline"
                      size={32}
                      color={Colors.textMuted}
                    />
                  </View>
                  <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
                    No Announcements
                  </Text>
                  <Text style={[tw`text-sm text-center mt-1`, { color: Colors.textSecondary }]}>
                    You're all caught up! New announcements will appear here.
                  </Text>
                </View>
              );
            }
            return (
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AnnouncementCard
                    announcement={item}
                    onPress={() => handleViewAnnouncement(item)}
                  />
                )}
                scrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            );
          }}
        </PageLoader>
      </View>

      {/* Detail Modal */}
      <AnnouncementDetail
        announcement={selectedAnnouncement}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
