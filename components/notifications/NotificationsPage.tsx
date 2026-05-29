import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "sonner-native";

import apiClient, { ApiResponseV2 } from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import { extract_message } from "@/helpers/apihelpers";
import PageLoader from "@/components/layout/PageLoader";
import Pagination from "@/components/ui/Pagination";
import { useSocketStore } from "@/store/socket-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "alert" | "update" | "success" | "INFO";

interface Notification {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  type: NotificationType;
  date: string;
  isRead: boolean;
}

type FilterType = "all" | "unread" | "read";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIcon(type: NotificationType, size = 20) {
  switch (type) {
    case "alert":
      return <Ionicons name="warning-outline" size={size} color="#EF4444" />;
    case "success":
      return (
        <Ionicons name="checkmark-circle-outline" size={size} color="#22C55E" />
      );
    case "update":
      return <Ionicons name="time-outline" size={size} color="#3B82F6" />;
    case "INFO":
    default:
      return (
        <Ionicons
          name="information-circle-outline"
          size={size}
          color={Colors.brand}
        />
      );
  }
}

function getIconBg(type: NotificationType): string {
  switch (type) {
    case "alert":
      return "#FEE2E2";
    case "success":
      return "#DCFCE7";
    case "update":
      return "#DBEAFE";
    case "INFO":
    default:
      return "#FEF3E2";
  }
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        tw`flex-row items-start gap-3 px-4 py-4`,
        { backgroundColor: notification.isRead ? "#fff" : "#EFF6FF18" },
        { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
      ]}
    >
      <View
        style={[
          tw`w-10 h-10 rounded-full items-center justify-center shrink-0`,
          { backgroundColor: getIconBg(notification.type) },
        ]}
      >
        {getIcon(notification.type)}
      </View>

      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center justify-between gap-2 mb-0.5`}>
          <Text
            style={[
              tw`text-sm font-semibold flex-1`,
              {
                color: notification.isRead
                  ? Colors.textSecondary
                  : Colors.textPrimary,
              },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={[tw`text-xs shrink-0`, { color: Colors.textMuted }]}>
            {notification.date}
          </Text>
        </View>
        <Text
          style={[tw`text-xs leading-5`, { color: Colors.textSecondary }]}
          numberOfLines={2}
        >
          {notification.content}
        </Text>
      </View>

      {!notification.isRead && (
        <View
          style={[
            tw`w-2 h-2 rounded-full mt-1.5 shrink-0`,
            { backgroundColor: "#3B82F6" },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function NotificationDetail({
  notification,
  visible,
  onClose,
}: {
  notification: Notification | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[tw`flex-1 justify-end`, { backgroundColor: "#00000044" }]}>
        <View
          style={[
            tw`bg-white rounded-t-3xl px-5 pt-5 pb-10`,
            { minHeight: 300 },
          ]}
        >
          {/* Handle */}
          <View
            style={[
              tw`w-10 h-1 rounded-full self-center mb-5`,
              { backgroundColor: "#E5E7EB" },
            ]}
          />

          {/* Type badge */}
          <View
            style={[
              tw`self-start flex-row items-center gap-2 px-3 py-2 rounded-xl mb-4`,
              { backgroundColor: getIconBg(notification.type) },
            ]}
          >
            {getIcon(notification.type, 16)}
            <Text
              style={[
                tw`text-xs font-semibold uppercase tracking-wider`,
                { color: Colors.textSecondary },
              ]}
            >
              {notification.type}
            </Text>
            <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
              · {notification.date}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={[tw`text-lg font-bold mb-3`, { color: Colors.textPrimary }]}
          >
            {notification.title}
          </Text>

          {/* Content */}
          <Text
            style={[tw`text-sm leading-6`, { color: Colors.textSecondary }]}
          >
            {notification.content}
          </Text>

          {/* Close */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={[
              tw`mt-8 py-3 rounded-2xl items-center`,
              { backgroundColor: Colors.brand },
            ]}
          >
            <Text style={tw`text-sm font-semibold text-white`}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface NotificationsPageProps {
  userType: "investor" | "partner";
}

export default function NotificationsPage({
  userType,
}: NotificationsPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Notification | null>(null);

  const query = useQuery<ApiResponseV2<Notification[]>>({
    queryKey: [`notifications-${userType}`, page],
    queryFn: async () => {
      const resp = await apiClient.get("/notifications", { params: { page } });
      return resp.data;
    },
  });

  const fetchUnreadCounts = useSocketStore((s) => s.fetchUnreadCounts);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`notifications-${userType}`] });
    fetchUnreadCounts();
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiClient.patch("/notifications/read-all"),
    onSuccess: invalidate,
  });

  const handleOpen = (notification: Notification) => {
    setSelected(notification);
    if (!notification.isRead) markReadMutation.mutate(notification.id);
  };

  const handleMarkAll = () => {
    toast.promise(markAllMutation.mutateAsync(), {
      loading: "Marking all as read...",
      success: () => "All notifications marked as read",
      error: (e) => extract_message(e) ?? "Failed",
    });
  };

  const list: Notification[] = query.data?.data?.data ?? [];
  const unreadCount: number =
    (query.data?.data as any)?.unreadCount ??
    list.filter((n) => !n.isRead).length;

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center justify-between px-4 py-3 bg-white border-b`,
          { borderBottomColor: Colors.divider },
        ]}
      >
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-2 -ml-2`}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={[tw`text-xl font-bold`, { color: Colors.textPrimary }]}
            >
              Notifications
            </Text>
            <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
              {list.length} total
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAll}
            disabled={markAllMutation.isPending}
            activeOpacity={0.7}
            style={[
              tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg`,
              { backgroundColor: Colors.inputBg },
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={16}
              color={Colors.brand}
            />
            <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View
        style={[
          tw`flex-row px-4 pt-3 pb-2 gap-2 bg-white border-b`,
          { borderBottomColor: Colors.divider },
        ]}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => {
              setFilter(f.key);
              setPage(1);
            }}
            activeOpacity={0.7}
            style={[
              tw`px-4 py-1.5 rounded-lg`,
              {
                backgroundColor:
                  filter === f.key ? Colors.textPrimary : Colors.inputBg,
              },
            ]}
          >
            <Text
              style={[
                tw`text-sm font-medium`,
                { color: filter === f.key ? "#fff" : Colors.textSecondary },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List / states */}
      <PageLoader query={query} loadingText="Loading notifications...">
        {(data) => {
          const items: Notification[] = data?.data?.data ?? [];
          const meta = data?.data?.meta ?? {};
          const totalPages: number = meta.totalPages ?? 1;
          const hasNext: boolean = meta.hasNext ?? page < totalPages;
          const hasPrev: boolean = meta.hasPrev ?? page > 1;

          const filtered = items.filter((n) => {
            if (filter === "unread") return !n.isRead;
            if (filter === "read") return n.isRead;
            return true;
          });

          if (filtered.length === 0) {
            return (
              <View style={tw`flex-1 items-center justify-center px-6`}>
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
                <Text
                  style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}
                >
                  No notifications
                </Text>
                <Text
                  style={[
                    tw`text-sm text-center mt-1`,
                    { color: Colors.textSecondary },
                  ]}
                >
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "Nothing here yet."}
                </Text>
              </View>
            );
          }

          return (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NotificationCard
                  notification={item}
                  onPress={() => handleOpen(item)}
                />
              )}
              style={tw`bg-white flex-1`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
              ListFooterComponent={
                totalPages > 1 ? (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    hasNext={hasNext}
                    hasPrev={hasPrev}
                    onNext={() => setPage((p) => p + 1)}
                    onPrev={() => setPage((p) => p - 1)}
                    onGoTo={setPage}
                  />
                ) : null
              }
            />
          );
        }}
      </PageLoader>

      <NotificationDetail
        notification={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}
