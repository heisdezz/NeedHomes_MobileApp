import apiClient, { ApiResponse } from "./api";

export interface UPLOAD_IMAGE_RESPONSE extends ApiResponse<{
  url: string;
  publicId: string;
}> {}

/**
 * Upload image from React Native
 * @param imageUri - URI from expo-image-picker (e.g., "file:///path/to/image.jpg")
 * @param fileName - Optional filename (defaults to timestamp-based name)
 * @param fileType - Optional file type (defaults to "image/jpeg")
 */
export const uploadImage = async (
  imageUri: string,
  fileName?: string,
  fileType?: string,
): Promise<UPLOAD_IMAGE_RESPONSE> => {
  // Extract filename from URI if not provided
  const uriParts = imageUri.split("/");
  const defaultFileName =
    uriParts[uriParts.length - 1] || `image_${Date.now()}.jpg`;

  // Determine file type from URI or use default
  let mimeType = fileType || "image/jpeg";
  if (!fileType) {
    const extension = imageUri.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "png":
        mimeType = "image/png";
        break;
      case "jpg":
      case "jpeg":
        mimeType = "image/jpeg";
        break;
      case "gif":
        mimeType = "image/gif";
        break;
      case "webp":
        mimeType = "image/webp";
        break;
      default:
        mimeType = "image/jpeg";
    }
  }

  // Create FormData for React Native
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: fileName || defaultFileName,
    type: mimeType,
  } as any);

  const resp = await apiClient.post("multimedia/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return resp.data;
};

/**
 * Upload multiple images
 * @param imageUris - Array of URIs from expo-image-picker
 */
export const uploadMultipleImages = async (
  imageUris: string[],
): Promise<UPLOAD_IMAGE_RESPONSE[]> => {
  const uploadPromises = imageUris.map((uri) => uploadImage(uri));
  return Promise.all(uploadPromises);
};
