import { useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/lib/tw";

type Props = {
  images: string[];
  height?: number;
  onBack?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
};

export default function ImageCarousel({
  images,
  height = 260,
  onBack,
  onBookmark,
  isBookmarked = false,
}: Props) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  const hasImages = images.length > 0;

  return (
    <View style={{ height, width, backgroundColor: "#D1D5DB" }}>
      {/* Slides */}
      {hasImages ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ width, height }}
        >
          {images.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={{ width, height }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View style={tw`w-full h-full items-center justify-center`}>
          <Ionicons name="home" size={48} color="#9CA3AF" />
        </View>
      )}

      {/* Dim overlay */}
      <View
        style={[
          tw`absolute inset-0`,
          { backgroundColor: "rgba(0,0,0,0.18)" },
        ]}
        pointerEvents="none"
      />

      {/* Back + Bookmark */}
      <View style={tw`absolute top-4 left-4 right-4 flex-row justify-between`}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            style={[
              tw`w-9 h-9 rounded-full items-center justify-center`,
              { backgroundColor: "rgba(0,0,0,0.4)" },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        {onBookmark && (
          <TouchableOpacity
            onPress={onBookmark}
            activeOpacity={0.8}
            style={[
              tw`w-9 h-9 rounded-full items-center justify-center`,
              { backgroundColor: "rgba(0,0,0,0.4)" },
            ]}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Dot indicators */}
      {images.length > 1 && (
        <View
          style={tw`absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5`}
        >
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                {
                  width: i === activeIndex ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    i === activeIndex
                      ? "#fff"
                      : "rgba(255,255,255,0.45)",
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}
