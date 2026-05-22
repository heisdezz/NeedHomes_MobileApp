import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export default function PartnerCalendar({ onPress }: { onPress?: () => void }) {
  const now = new Date();
  const day = now.getDate();
  const weekday = DAYS[now.getDay()];
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        tw`mx-4 rounded-2xl overflow-hidden flex-row`,
        { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      {/* Left orange strip */}
      <View
        style={[
          tw`px-4 py-5 items-center justify-center gap-2`,
          { backgroundColor: Colors.brand, minWidth: 100 },
        ]}
      >
        <Ionicons name="calendar-outline" size={22} color="#fff" />
        <Text style={tw`text-white text-sm font-bold`}>Calendar</Text>
      </View>

      {/* Right content */}
      <View style={tw`flex-1 px-4 py-4 justify-between`}>
        <View style={tw`flex-row items-baseline gap-2`}>
          <Text style={[tw`text-4xl font-bold`, { color: Colors.textPrimary }]}>{day}</Text>
          <Text style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}>
            {weekday}
          </Text>
          <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>{month} {year}</Text>
        </View>

        <View style={tw`flex-row items-center justify-between mt-2`}>
          <View style={[tw`px-2.5 py-1 rounded-full`, { backgroundColor: Colors.brand + "20" }]}>
            <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>• Today</Text>
          </View>
          <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>Click to view calendar</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
