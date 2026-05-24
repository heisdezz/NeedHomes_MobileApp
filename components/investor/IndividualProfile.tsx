import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/store";
import { set_user_value } from "@/store/auth-store";
import apiClient, { type ApiResponse } from "@/lib/api";
import { uploadImage } from "@/lib/imageApi";
import FormInput from "@/components/ui/form-input";
import PrimaryButton from "@/components/primary-button";
import tw from "@/lib/tw";

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
}

function AvatarPicker({
  uri,
  initials,
  onPick,
  loading,
}: {
  uri: string | null;
  initials: string;
  onPick: () => void;
  loading: boolean;
}) {
  return (
    <View style={tw`items-center mb-6`}>
      <TouchableOpacity onPress={onPick} activeOpacity={0.8}>
        <View
          style={[
            tw`w-24 h-24 rounded-full overflow-hidden items-center justify-center`,
            { backgroundColor: "#E5E7EB" },
          ]}
        >
          {uri ? (
            <Image source={{ uri }} style={tw`w-24 h-24`} resizeMode="cover" />
          ) : (
            <Text
              style={[tw`text-3xl font-bold`, { color: Colors.textSecondary }]}
            >
              {initials}
            </Text>
          )}
          {loading && (
            <View
              style={[
                tw`absolute inset-0 items-center justify-center`,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            >
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>
        <View
          style={[
            tw`absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center`,
            { backgroundColor: Colors.brand },
          ]}
        >
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={[tw`text-xs mt-2`, { color: Colors.textMuted }]}>
        Tap to change photo
      </Text>
    </View>
  );
}

export default function IndividualProfile() {
  const auth = useAuth();
  const user = auth?.user;

  const [form, setForm] = useState<ProfileForm>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: String(user?.phone ?? ""),
  });
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.profilePicture ?? null,
  );
  const [stagedAvatar, setStagedAvatar] = useState<{
    uri: string;
    fileName?: string;
    mimeType?: string;
  } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const mutation = useMutation({
    mutationFn: async (data: ProfileForm & { profilePicture?: string }) => {
      const resp = await apiClient.put<ApiResponse>("users/profile", data);
      return resp.data;
    },
    onSuccess: (resp) => {
      if (auth) set_user_value({ ...auth, user: resp.data });
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    },
  });

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setStagedAvatar({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });
      setAvatarUri(asset.uri);
    }
  }

  function validate() {
    const e: Partial<ProfileForm> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    let profilePicture: string | undefined;
    if (stagedAvatar) {
      setAvatarUploading(true);
      try {
        const res = await uploadImage(
          stagedAvatar.uri,
          stagedAvatar.fileName,
          stagedAvatar.mimeType,
        );
        profilePicture = res.data.url;
        setStagedAvatar(null);
      } catch {
        toast.error("Failed to upload photo");
        setAvatarUploading(false);
        return;
      }
      setAvatarUploading(false);
    }

    mutation.mutate({ ...form, ...(profilePicture ? { profilePicture } : {}) });
  }

  const busy = mutation.isPending || avatarUploading;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <AvatarPicker
        uri={avatarUri}
        initials={initials}
        onPick={pickAvatar}
        loading={avatarUploading}
      />

      <View style={tw`gap-4`}>
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <FormInput
              label="First Name"
              placeholder="First Name"
              value={form.firstName}
              onChangeText={(t) => {
                setForm((f) => ({ ...f, firstName: t }));
                if (errors.firstName)
                  setErrors((e) => ({ ...e, firstName: undefined }));
              }}
              error={errors.firstName}
            />
          </View>
          <View style={tw`flex-1`}>
            <FormInput
              label="Last Name"
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={(t) => {
                setForm((f) => ({ ...f, lastName: t }));
                if (errors.lastName)
                  setErrors((e) => ({ ...e, lastName: undefined }));
              }}
              error={errors.lastName}
            />
          </View>
        </View>

        <FormInput
          label="Email"
          placeholder="Email"
          value={user?.email ?? ""}
          editable={false}
          keyboardType="email-address"
        />

        <FormInput
          label="Phone Number"
          placeholder="e.g. 08012345678"
          value={form.phone}
          onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
          keyboardType="phone-pad"
        />

        <PrimaryButton
          label={busy ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          loading={busy}
          disabled={busy}
        />
      </View>
    </ScrollView>
  );
}
