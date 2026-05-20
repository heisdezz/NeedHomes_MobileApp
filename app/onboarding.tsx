import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ListRenderItemInfo,
} from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "@/lib/tw";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    image: require("@/assets/onboarding/onboarding_1.png"),
    title: "Discover. Buy. Invest.\nOn Needhomes",
    buttonLabel: "Next",
  },
  {
    id: "2",
    image: require("@/assets/onboarding/onboarding_2.png"),
    title: "Track Your Investment\nWhile Making Profits",
    buttonLabel: "Next",
  },
  {
    id: "3",
    image: require("@/assets/onboarding/onboarding_3.png"),
    title: "Promote Properties,\nEarn Commision",
    buttonLabel: "Explore",
  },
];

type Slide = (typeof SLIDES)[number];

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={tw`flex-1 items-center justify-center bg-[#3C3C44]`}>
      <Image
        source={require("@/assets/need/logo.png")}
        style={tw`w-56 h-28  `}
        resizeMode="contain"
      />
    </View>
  );
}

function SlideItem({ item }: { item: Slide }) {
  return (
    <View style={[tw`items-center`, { width }]}>
      {/* Image card */}
      <View
        style={tw`rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg`}
        // slight tilt via a wrapper rotation
      >
        <Image
          source={item.image}
          style={{ width: width * 0.78, height: width * 0.78 }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const AUTO_SCROLL_INTERVAL = 3000;

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasSeenOnboarding = useOnboardingStore(
    (s) => s.setHasSeenOnboarding,
  );
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  // Auto-scroll: advances every interval, stops on last slide
  useEffect(() => {
    if (showSplash) return;
    if (isLast) {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      return;
    }
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [showSplash, isLast]);

  // Pause auto-scroll and reset timer when user swipes manually
  const handleSwipe = (index: number) => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (!isLast) {
      scrollTo(currentIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace("/auth/sign-up");
    }
  };

  if (showSplash) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#3C3C44]`}>
        <SplashScreen onDone={() => setShowSplash(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#3C3C44]`} edges={["top", "bottom"]}>
      {/* Header logo */}
      <View style={tw`items-center pt-6 pb-4`}>
        <Image
          source={require("@/assets/need/logo.png")}
          style={tw`w-36 h-14`}
          resizeMode="contain"
        />
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }: ListRenderItemInfo<Slide>) => (
          <SlideItem item={item} />
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          handleSwipe(index);
        }}
        style={tw`flex-1`}
        contentContainerStyle={tw`items-center`}
      />

      {/* Bottom section */}
      <View style={tw`px-8 pb-10 items-center gap-6`}>
        {/* Dot indicators */}
        <View style={tw`flex-row gap-2`}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={tw`rounded-full ${
                i === currentIndex
                  ? "w-5 h-2 bg-[#F56821]"
                  : "w-2 h-2 bg-white/30"
              }`}
            />
          ))}
        </View>

        {/* Title */}
        <Text
          style={tw`text-white text-xl font-semibold text-center leading-7`}
        >
          {SLIDES[currentIndex].title}
        </Text>

        {/* Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={tw`bg-[#F56821] rounded-xl py-4 w-full items-center`}
        >
          <Text style={tw`text-white text-base font-semibold`}>
            {SLIDES[currentIndex].buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
