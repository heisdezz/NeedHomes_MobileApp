# Image Upload API Guide

## Overview

The `imageApi.ts` has been updated to work with React Native mobile devices, using URIs from `expo-image-picker` instead of web APIs like `File` and `Blob`.

## Usage

### Basic Upload

```tsx
import { uploadImage } from "@/lib/imageApi";
import * as ImagePicker from "expo-image-picker";

// Pick an image
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: "images",
  allowsEditing: true,
  quality: 0.8,
});

if (!result.canceled && result.assets[0]) {
  const imageUri = result.assets[0].uri;
  
  // Upload the image
  const uploaded = await uploadImage(imageUri);
  console.log("Uploaded URL:", uploaded.data.url);
  console.log("Public ID:", uploaded.data.publicId);
}
```

### Upload with Custom Filename

```tsx
const uploaded = await uploadImage(
  imageUri,
  "profile-photo.jpg" // Custom filename
);
```

### Upload with Specific File Type

```tsx
const uploaded = await uploadImage(
  imageUri,
  "document.png",
  "image/png" // Explicit MIME type
);
```

### Upload Multiple Images

```tsx
import { uploadMultipleImages } from "@/lib/imageApi";

const imageUris = [uri1, uri2, uri3];
const uploadedImages = await uploadMultipleImages(imageUris);

uploadedImages.forEach((img, index) => {
  console.log(`Image ${index + 1}:`, img.data.url);
});
```

## API Reference

### `uploadImage(imageUri, fileName?, fileType?)`

Upload a single image from React Native.

**Parameters:**
- `imageUri` (string, required): URI from expo-image-picker (e.g., `"file:///path/to/image.jpg"`)
- `fileName` (string, optional): Custom filename. Defaults to extracted filename or timestamp-based name
- `fileType` (string, optional): MIME type. Auto-detected from extension if not provided

**Returns:** `Promise<UPLOAD_IMAGE_RESPONSE>`
```typescript
{
  message: string;
  data: {
    url: string;      // Full URL of uploaded image
    publicId: string; // Public ID for image management
  };
  statusCode: number;
  path: string;
}
```

**Supported Image Types:**
- JPEG (`.jpg`, `.jpeg`) → `image/jpeg`
- PNG (`.png`) → `image/png`
- GIF (`.gif`) → `image/gif`
- WebP (`.webp`) → `image/webp`

### `uploadMultipleImages(imageUris)`

Upload multiple images concurrently.

**Parameters:**
- `imageUris` (string[], required): Array of image URIs

**Returns:** `Promise<UPLOAD_IMAGE_RESPONSE[]>`

## Complete Example

### Profile Picture Upload

```tsx
import { useState } from "react";
import { View, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/lib/imageApi";
import { toast } from "sonner-native";

export function ProfilePictureUpload() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickAndUploadImage = async () => {
    // Request permissions
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error("Permission to access gallery is required");
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);

    // Upload image
    try {
      setUploading(true);
      const uploaded = await uploadImage(uri, "profile.jpg");
      
      // Save to backend
      await updateProfile({ profilePicture: uploaded.data.url });
      
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity onPress={pickAndUploadImage} disabled={uploading}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />
      ) : (
        <View style={{ width: 100, height: 100, backgroundColor: "#ccc" }} />
      )}
      {uploading && <ActivityIndicator />}
    </TouchableOpacity>
  );
}
```

### Chat Image Upload

```tsx
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/lib/imageApi";

export function ChatImageButton({ onImageUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const uploaded = await uploadImage(result.assets[0].uri);
      onImageUploaded(uploaded.data.url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
      <Ionicons 
        name="image-outline" 
        size={24} 
        color={uploading ? "#999" : "#000"} 
      />
    </TouchableOpacity>
  );
}
```

### Multiple Image Upload

```tsx
import { useState } from "react";
import { FlatList, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadMultipleImages } from "@/lib/imageApi";

export function MultipleImageUpload() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const uris = result.assets.map(asset => asset.uri);
      const uploadedImages = await uploadMultipleImages(uris);
      
      const urls = uploadedImages.map(img => img.data.url);
      setImages(urls);
      
      toast.success(`Uploaded ${urls.length} images`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button onPress={pickMultipleImages} disabled={uploading}>
        Pick Images
      </Button>
      <FlatList
        data={images}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width: 100, height: 100 }} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </>
  );
}
```

## Error Handling

### Common Errors

```tsx
try {
  const uploaded = await uploadImage(imageUri);
} catch (error) {
  if (error.response?.status === 413) {
    toast.error("Image is too large");
  } else if (error.response?.status === 415) {
    toast.error("Unsupported image format");
  } else if (error.code === "NETWORK_ERROR") {
    toast.error("No internet connection");
  } else {
    toast.error("Failed to upload image");
  }
}
```

### With Loading State

```tsx
const [uploading, setUploading] = useState(false);
const [progress, setProgress] = useState(0);

const handleUpload = async (uri: string) => {
  try {
    setUploading(true);
    const uploaded = await uploadImage(uri);
    return uploaded.data.url;
  } catch (error) {
    throw error;
  } finally {
    setUploading(false);
  }
};
```

## Image Optimization Tips

### 1. Compress Before Upload

```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: "images",
  quality: 0.7, // 70% quality (smaller file size)
  allowsEditing: true,
});
```

### 2. Resize Images

```tsx
import * as ImageManipulator from 'expo-image-manipulator';

const resizedImage = await ImageManipulator.manipulateAsync(
  imageUri,
  [{ resize: { width: 1000 } }], // Max width 1000px
  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
);

await uploadImage(resizedImage.uri);
```

### 3. Limit Image Size

```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: "images",
  quality: 0.8,
});

if (result.assets[0]) {
  const asset = result.assets[0];
  
  // Check file size (if available)
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
    toast.error("Image must be less than 5MB");
    return;
  }
  
  await uploadImage(asset.uri);
}
```

## Migration from Web API

### Before (Web):
```tsx
const formData = new FormData();
formData.append("file", blob);
await uploadImage(blob);
```

### After (React Native):
```tsx
const imageUri = result.assets[0].uri;
await uploadImage(imageUri);
```

## Platform Differences

### iOS
- Full camera roll access
- HEIC images converted to JPEG automatically
- Live Photos supported

### Android
- Requires storage permissions
- Different URI format (`content://` vs `file://`)
- Works seamlessly with the updated API

## Testing

```tsx
// Test upload
import { uploadImage } from "@/lib/imageApi";

const testUpload = async () => {
  const testUri = "file:///path/to/test/image.jpg";
  
  try {
    const result = await uploadImage(testUri);
    console.log("✅ Upload successful:", result.data.url);
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
};
```

## Backend Requirements

Your backend must support:
- `multipart/form-data` content type
- File field named `"file"`
- Return format: `{ url: string, publicId: string }`

Example endpoint response:
```json
{
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://cdn.example.com/images/abc123.jpg",
    "publicId": "abc123"
  },
  "statusCode": 200,
  "path": "/multimedia/upload"
}
```

---

**Image upload now works seamlessly on mobile!** 📸✨
