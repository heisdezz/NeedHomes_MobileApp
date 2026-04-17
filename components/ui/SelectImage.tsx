import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tw';
import { Colors } from '@/constants/theme';

export type SelectedImage = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

type Props = {
  title?: string;
  value?: SelectedImage | null;
  prevUrl?: string | null;
  onChange: (image: SelectedImage | null) => void;
};

export default function SelectImage({ title, value, prevUrl, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onChange({ uri: asset.uri, fileName: asset.fileName ?? undefined, mimeType: asset.mimeType ?? undefined });
      }
    } finally {
      setLoading(false);
    }
  };

  const displayUri = value?.uri ?? prevUrl ?? null;

  return (
    <View style={tw`gap-1.5`}>
      {title ? <Text style={tw`text-sm font-semibold text-[${Colors.textPrimary}]`}>{title}</Text> : null}

      <TouchableOpacity
        onPress={pick}
        activeOpacity={0.8}
        style={tw`border-2 border-dashed border-[${Colors.inputBorder}] rounded-xl overflow-hidden`}
      >
        {loading ? (
          <View style={tw`h-36 items-center justify-center`}>
            <ActivityIndicator color={Colors.brand} />
          </View>
        ) : displayUri ? (
          <View style={tw`relative`}>
            <Image source={{ uri: displayUri }} style={tw`w-full h-36`} resizeMode="cover" />
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onChange(null); }}
              style={[
                tw`absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center`,
                { backgroundColor: 'rgba(0,0,0,0.55)' },
              ]}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={tw`h-36 items-center justify-center gap-2`}>
            <Ionicons name="cloud-upload-outline" size={32} color={Colors.textMuted} />
            <Text style={tw`text-sm font-semibold text-[${Colors.textMuted}]`}>Tap to upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
