import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  onGoTo,
}: PaginationProps) {
  const pages = getPageNumbers(Math.max(page, 1), Math.max(totalPages, 1));

  return (
    <View style={tw`items-center py-4`}>
      {/* Page info */}
      <Text style={[tw`text-xs mb-3`, { color: Colors.textMuted }]}>
        Page {page} of {totalPages}
      </Text>

      <View style={tw`flex-row items-center gap-1.5`}>
        {/* Prev */}
        <TouchableOpacity
          onPress={onPrev}
          disabled={!hasPrev}
          activeOpacity={0.7}
          style={[
            tw`w-9 h-9 rounded-xl items-center justify-center`,
            {
              backgroundColor: hasPrev ? Colors.brand + "15" : "#F3F4F6",
              borderWidth: 1,
              borderColor: hasPrev ? Colors.brand + "40" : Colors.divider,
            },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={hasPrev ? Colors.brand : Colors.textMuted}
          />
        </TouchableOpacity>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <View
              key={`ellipsis-${i}`}
              style={tw`w-9 h-9 items-center justify-center`}
            >
              <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>…</Text>
            </View>
          ) : (
            <TouchableOpacity
              key={p}
              onPress={() => onGoTo(p)}
              activeOpacity={0.7}
              style={[
                tw`w-9 h-9 rounded-xl items-center justify-center`,
                p === page
                  ? { backgroundColor: Colors.brand }
                  : {
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: Colors.divider,
                    },
              ]}
            >
              <Text
                style={[
                  tw`text-sm font-semibold`,
                  { color: p === page ? "#fff" : Colors.textSecondary },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ),
        )}

        {/* Next */}
        <TouchableOpacity
          onPress={onNext}
          disabled={!hasNext}
          activeOpacity={0.7}
          style={[
            tw`w-9 h-9 rounded-xl items-center justify-center`,
            {
              backgroundColor: hasNext ? Colors.brand + "15" : "#F3F4F6",
              borderWidth: 1,
              borderColor: hasNext ? Colors.brand + "40" : Colors.divider,
            },
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={hasNext ? Colors.brand : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
