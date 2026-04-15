import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding each side

export type PromoSlide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  onPress?: () => void;
  imageUri?: string;
};

const DEFAULT_SLIDES: PromoSlide[] = [
  {
    id: "1",
    badge: "Cross-Sales Promotions",
    title: "",
    description: "Other investment packages you can diversify in",
    ctaLabel: "Explore",
  },
  {
    id: "2",
    badge: "New Listings",
    title: "",
    description: "Discover newly added properties across prime locations",
    ctaLabel: "View All",
  },
];

type Props = {
  slides?: PromoSlide[];
};

export default function PromoCarousel({ slides = DEFAULT_SLIDES }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = e.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(offset / CARD_WIDTH));
  }
  // return <View></View>;
  return (
    <View style={tw`px-4 max-h-[220px]`}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={[
              tw`rounded-2xl overflow-hidden flex-row`,
              {
                width: CARD_WIDTH,
                backgroundColor: Colors.surface,
                marginRight: 0,
                minHeight: 140,
              },
            ]}
          >
            {/* Text side */}
            <View style={tw`flex-1 p-4 justify-between`}>
              <View>
                <View
                  style={[
                    tw`self-start px-3 py-1 rounded-full mb-3`,
                    { backgroundColor: "rgba(255,255,255,0.15)" },
                  ]}
                >
                  <Text style={tw`text-white text-xs font-medium`}>
                    {slide.badge}
                  </Text>
                </View>
                <Text
                  style={[
                    tw`text-sm leading-5`,
                    { color: "rgba(255,255,255,0.85)" },
                  ]}
                >
                  {slide.description}
                </Text>
              </View>

              <TouchableOpacity
                onPress={slide.onPress}
                activeOpacity={0.8}
                style={[
                  tw`self-start px-5 py-2 rounded-full mt-4`,
                  { backgroundColor: Colors.brand },
                ]}
              >
                <Text style={tw`text-white text-xs font-bold`}>
                  {slide.ctaLabel}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Image side */}
            <View style={[tw`w-36 overflow-hidden`, { borderRadius: 0 }]}>
              {slide.imageUri ? (
                <Image
                  source={{ uri: slide.imageUri }}
                  style={tw`w-full h-full`}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    tw`w-full h-full items-center justify-center`,
                    { backgroundColor: "#4A4A55" },
                  ]}
                >
                  <Text style={{ fontSize: 48 }}>🏠</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      {slides.length > 1 && (
        <View style={tw`flex-row justify-center gap-1.5 mt-3`}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                tw`rounded-full`,
                {
                  width: i === activeIndex ? 20 : 6,
                  height: 6,
                  backgroundColor:
                    i === activeIndex ? Colors.brand : "rgba(255,255,255,0.3)",
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}
