import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as aesjs from "aes-js";
import "react-native-get-random-values";

class SecureAsyncStorage {
  // Get the encryption key or generate it if it doesn't exist
  private async getEncryptionKey(key: string): Promise<Uint8Array> {
    const storedKeyHex = await SecureStore.getItemAsync(key);
    if (storedKeyHex) {
      return aesjs.utils.hex.toBytes(storedKeyHex);
    }

    // Generate an AES-256 key (32 bytes)
    const newKey = crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = AES-256 key
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(newKey));
    return newKey;
  }

  private async _encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = await this.getEncryptionKey(key);

    // Encrypt the value using AES-CTR
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    // Return the encrypted value as a hex string
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string): Promise<string> {
    // Retrieve the encryption key from SecureStore
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      // No encryption key means the value is likely unencrypted legacy data.
      return "";
    }
    const encryptionKey = aesjs.utils.hex.toBytes(encryptionKeyHex);
    // Decrypt the value using AES-CTR with the retrieved key
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const storedValue = await AsyncStorage.getItem(key);
    if (!storedValue) {
      return storedValue;
    }
    try {
      // If there's no encryption key, assume the data is legacy unencrypted data.
      const encryptionKeyHex = await SecureStore.getItemAsync(key);
      if (!encryptionKeyHex) {
        return storedValue;
      }
      return await this._decrypt(key, storedValue);
    } catch (error) {
      console.error(
        "Decryption failed. Possibly legacy unencrypted data is present.",
        error
      );
      // Optionally, remove the corrupted value here.
      return storedValue;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
}

export default SecureAsyncStorage;
