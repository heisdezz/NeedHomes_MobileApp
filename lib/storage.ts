import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

// SecureStore enforces a 2048-byte limit per key.
// Large auth payloads (roles, permissions, etc.) exceed this, so we chunk them.
const CHUNK_SIZE = 1800; // safely under the limit

const chunkString = (str: string): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    chunks.push(str.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
};

export const expoSecureStorage: StateStorage = {
  getItem: async (name) => {
    const countStr = await SecureStore.getItemAsync(`${name}_count`);
    if (!countStr) return null;
    const count = parseInt(countStr, 10);
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(`${name}_${i}`)
      )
    );
    if (chunks.some((c) => c === null)) return null;
    return (chunks as string[]).join('');
  },

  setItem: async (name, value) => {
    const chunks = chunkString(value);
    await SecureStore.setItemAsync(`${name}_count`, String(chunks.length));
    await Promise.all(
      chunks.map((chunk, i) => SecureStore.setItemAsync(`${name}_${i}`, chunk))
    );
  },

  removeItem: async (name) => {
    const countStr = await SecureStore.getItemAsync(`${name}_count`);
    if (!countStr) return;
    const count = parseInt(countStr, 10);
    await Promise.all([
      SecureStore.deleteItemAsync(`${name}_count`),
      ...Array.from({ length: count }, (_, i) =>
        SecureStore.deleteItemAsync(`${name}_${i}`)
      ),
    ]);
  },
};
