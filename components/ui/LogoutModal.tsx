import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/lib/tw";

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ visible, onCancel, onConfirm }: LogoutModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable
        style={[tw`flex-1 items-center justify-center px-6`, { backgroundColor: "rgba(0,0,0,0.45)" }]}
        onPress={onCancel}
      >
        <Pressable
          style={[tw`w-full rounded-3xl p-6 items-center`, { backgroundColor: "#fff" }]}
          onPress={() => {}}
        >
          {/* Icon */}
          <View
            style={[
              tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
              { backgroundColor: "#FEE2E2" },
            ]}
          >
            <View
              style={[
                tw`w-11 h-11 rounded-full items-center justify-center`,
                { borderWidth: 2, borderColor: "#EF4444" },
              ]}
            >
              <Text style={[tw`text-xl font-bold`, { color: "#EF4444", lineHeight: 22 }]}>!</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[tw`text-lg font-bold mb-2`, { color: "#111827" }]}>
            Confirm Logout
          </Text>

          {/* Body */}
          <Text style={[tw`text-sm text-center leading-5 mb-6`, { color: "#6B7280" }]}>
            Are you sure you want to log out? You will need to sign in again to access your account.
          </Text>

          {/* Buttons */}
          <View style={tw`flex-row gap-3 w-full`}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              style={[
                tw`flex-1 py-3.5 rounded-2xl items-center justify-center`,
                { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
              ]}
            >
              <Text style={[tw`text-sm font-semibold`, { color: "#374151" }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              style={[
                tw`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl`,
                { backgroundColor: "#EF4444" },
              ]}
            >
              <Ionicons name="log-out-outline" size={16} color="#fff" />
              <Text style={[tw`text-sm font-semibold`, { color: "#fff" }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
