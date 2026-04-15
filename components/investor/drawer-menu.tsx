import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/store";
import { logout } from "@/store/auth-store";
import tw from "@/lib/tw";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Profile Info", icon: "person-outline" },
  { label: "My Investments", icon: "trending-up-outline" },
  { label: "Wallet", icon: "wallet-outline" },
  { label: "Properties", icon: "home-outline" },
  { label: "Transactions", icon: "receipt-outline" },
  { label: "Announcements", icon: "megaphone-outline" },
  { label: "Chat", icon: "chatbubble-outline" },
  { label: "Notifications", icon: "notifications-outline" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

function IconCircle({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={tw`w-10 h-10 rounded-full items-center justify-center`}
      // light orange tint background
      // eslint-disable-next-line react-native/no-inline-styles
      // @ts-ignore
      // Using inline style for the peach/orange tint since it's not in the theme
    >
      <View
        style={[
          tw`w-10 h-10 rounded-full items-center justify-center`,
          { backgroundColor: "#FDE8DC" },
        ]}
      >
        <Ionicons name={name} size={18} color={Colors.brand} />
      </View>
    </View>
  );
}

export default function DrawerMenu({ visible, onClose }: Props) {
  const auth = useAuth();
  const user = auth?.user;
  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "Investor";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableOpacity
        style={tw`flex-1 bg-black/50`}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Drawer panel — stops touch propagation */}
        <TouchableOpacity
          activeOpacity={1}
          style={[
            tw`absolute right-0 top-0 bottom-0 bg-white w-4/5 rounded-l-3xl`,
            { elevation: 20 },
          ]}
          onPress={() => {}}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-10`}
          >
            {/* Header */}
            <View
              style={tw`flex-row items-center justify-between px-6 pt-10 pb-6`}
            >
              <View style={tw`flex-row items-center gap-3`}>
                <View
                  style={[
                    tw`w-12 h-12 rounded-full overflow-hidden items-center justify-center`,
                    { backgroundColor: "#E5E7EB" },
                  ]}
                >
                  {user?.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={tw`w-12 h-12`}
                    />
                  ) : (
                    <Ionicons name="person" size={26} color="#9CA3AF" />
                  )}
                </View>
                <View>
                  <Text style={tw`text-text-primary text-base font-bold`}>
                    {fullName || "User"}
                  </Text>
                  <Text style={tw`text-text-muted text-xs`}>Investor</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View
              style={[tw`h-px mx-6 mb-4`, { backgroundColor: "#F0F0F0" }]}
            />

            {/* Main menu items */}
            <View style={tw`px-4 gap-1`}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress ?? onClose}
                  activeOpacity={0.7}
                  style={tw`flex-row items-center gap-4 px-2 py-3 rounded-xl`}
                >
                  <IconCircle name={item.icon} />
                  <Text style={tw`text-text-primary text-sm font-medium`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Divider */}
            <View
              style={[tw`h-px mx-6 my-4`, { backgroundColor: "#F0F0F0" }]}
            />

            {/* Bottom: Settings + Logout */}
            <View style={tw`px-4 gap-1`}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={tw`flex-row items-center gap-4 px-2 py-3 rounded-xl`}
              >
                <IconCircle name="settings-outline" />
                <Text style={tw`text-text-primary text-sm font-medium`}>
                  Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  logout();
                }}
                activeOpacity={0.7}
                style={tw`flex-row items-center gap-4 px-2 py-3 rounded-xl`}
              >
                <View
                  style={[
                    tw`w-10 h-10 rounded-full items-center justify-center`,
                    { backgroundColor: "#FDE8DC" },
                  ]}
                >
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                </View>
                <Text style={tw`text-red-500 text-sm font-medium`}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
