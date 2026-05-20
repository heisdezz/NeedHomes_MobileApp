import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { QueryObserverResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Colors } from "@/constants/theme";
import { extract_message } from "@/helpers/apihelpers";
import type { ApiResponse } from "@/lib/api";
import tw from "@/lib/tw";

interface PageLoaderProps<TData> {
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  query: QueryObserverResult<TData>;
  customLoading?: React.ReactNode;
  loadingText?: string;
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingView({ loadingText }: { loadingText: string }) {
  const { height } = useWindowDimensions();
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(ring1, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.timing(ring2, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate1 = ring1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  // Counter-clockwise
  const rotate2 = ring2.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  return (
    <Animated.View
      style={[
        tw`w-full items-center justify-center p-8`,
        { minHeight: height * 0.6, opacity: fadeIn },
      ]}
    >
      {/* Spinner rings */}
      <View style={tw`items-center justify-center mb-8`}>
        {/* Outer ring – clockwise */}
        <Animated.View
          style={[
            tw`absolute rounded-full`,
            {
              width: 96,
              height: 96,
              borderWidth: 4,
              borderColor: "transparent",
              borderTopColor: Colors.brand,
              borderRadius: 48,
              transform: [{ rotate: rotate1 }],
            },
          ]}
        />
        {/* Inner ring – counter-clockwise */}
        <Animated.View
          style={[
            tw`absolute rounded-full`,
            {
              width: 80,
              height: 80,
              borderWidth: 4,
              borderColor: "transparent",
              borderBottomColor: Colors.brand + "66",
              borderRadius: 40,
              transform: [{ rotate: rotate2 }],
            },
          ]}
        />
        {/* Center icon */}
        <View
          style={[
            tw`w-12 h-12 rounded-xl items-center justify-center`,
            { backgroundColor: Colors.brand + "1A" },
          ]}
        >
          <Ionicons name="reload-outline" size={22} color={Colors.brand} />
        </View>
      </View>

      {/* Label */}
      <Text
        style={[
          tw`text-base font-semibold text-center`,
          { color: Colors.textInverse + "CC", letterSpacing: -0.3 },
        ]}
      >
        {loadingText}
      </Text>
    </Animated.View>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorView({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { height } = useWindowDimensions();
  const scale = useRef(new Animated.Value(0.95)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const is403 = (error as AxiosError<ApiResponse>)?.response?.status === 403;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 18,
        stiffness: 200,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (is403) {
    return (
      <Animated.View
        style={[
          tw`w-full items-center justify-center p-6`,
          { minHeight: height * 0.4, opacity: fadeIn, transform: [{ scale }] },
        ]}
      >
        <View
          style={[
            tw`mb-4 rounded-full p-3`,
            { backgroundColor: Colors.error + "1A" },
          ]}
        >
          <Ionicons name="shield-outline" size={32} color={Colors.error} />
        </View>
        <Text
          style={[
            tw`text-lg font-bold text-center`,
            { color: Colors.textInverse },
          ]}
        >
          Access Denied
        </Text>
        <Text
          style={[
            tw`mt-1 text-sm text-center`,
            { color: Colors.textMuted, maxWidth: 280, lineHeight: 20 },
          ]}
        >
          You don't have permission to view this resource. Contact support or a
          Super Admin to request access.
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        tw`w-full items-center justify-center p-6`,
        { minHeight: height * 0.4, opacity: fadeIn, transform: [{ scale }] },
      ]}
    >
      <View
        style={[
          tw`mb-4 rounded-full p-3`,
          { backgroundColor: Colors.error + "1A" },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={32} color={Colors.error} />
      </View>
      <Text
        style={[
          tw`text-lg font-bold text-center`,
          { color: Colors.textInverse },
        ]}
      >
        Something went wrong
      </Text>
      <Text
        style={[
          tw`mt-1 text-sm text-center`,
          { color: Colors.textMuted, maxWidth: 280, lineHeight: 20 },
        ]}
      >
        {extract_message(error as AxiosError<ApiResponse>)}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        style={[
          tw`mt-6 flex-row items-center gap-2 rounded-xl px-5 py-2.5`,
          { backgroundColor: Colors.brand },
        ]}
      >
        <Ionicons name="refresh-outline" size={16} color="#fff" />
        <Text style={tw`text-sm font-semibold text-white`}>Try Again</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Success wrapper ──────────────────────────────────────────────────────────

function FadeInView({ children }: { children: React.ReactNode }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeIn, flex: 1, transform: [{ translateY: slideY }] }}
    >
      {children}
    </Animated.View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PageLoader<TData>({
  query,
  customLoading,
  children,
  loadingText = "Loading resources...",
}: PageLoaderProps<TData>) {
  if (query.isLoading) {
    return customLoading ? (
      <>{customLoading}</>
    ) : (
      <LoadingView loadingText={loadingText} />
    );
  }

  if (query.isError) {
    return <ErrorView error={query.error} onRetry={query.refetch} />;
  }

  if (!query.data) return null;

  return (
    <View style={tw`  flex-1`}>
      <FadeInView>
        {typeof children === "function"
          ? (children as (data: TData) => React.ReactNode)(query.data)
          : children}
      </FadeInView>
    </View>
  );
}
