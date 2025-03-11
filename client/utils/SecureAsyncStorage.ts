import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as aesjs from "aes-js";
import "react-native-get-random-values";

class SecureAsyncStorage {
  // Get the encryption key or generate it if it doesn't exist
  private async getEncryptionKey(key: string): Promise<Uint8Array> {
    console.log(`SecureAsyncStorage: Retrieving encryption key for '${key}'.`);
    const storedKeyHex = await SecureStore.getItemAsync(key);
    if (storedKeyHex) {
      console.log(
        `SecureAsyncStorage: Found existing encryption key for '${key}'.`
      );
      return aesjs.utils.hex.toBytes(storedKeyHex);
    }

    console.log(
      `SecureAsyncStorage: No encryption key for '${key}' found. Generating new AES-256 key.`
    );
    // Generate an AES-256 key (32 bytes)
    const newKey = crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = AES-256 key
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(newKey));
    console.log(
      `SecureAsyncStorage: New encryption key generated and stored for '${key}'.`
    );
    return newKey;
  }

  private async _encrypt(key: string, value: string): Promise<string> {
    console.log(`SecureAsyncStorage: Encrypting value for key '${key}'.`);
    const encryptionKey = await this.getEncryptionKey(key);

    // Encrypt the value using AES-CTR
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    console.log(`SecureAsyncStorage: Encryption complete for key '${key}'.`);
    // Return the encrypted value as a hex string
    return encryptedHex;
  }

  private async _decrypt(key: string, value: string): Promise<string> {
    console.log(`SecureAsyncStorage: Decrypting value for key '${key}'.`);
    // Retrieve the encryption key from SecureStore
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      console.warn(
        `SecureAsyncStorage: No encryption key found for '${key}'. Assuming legacy unencrypted data.`
      );
      return "";
    }
    const encryptionKey = aesjs.utils.hex.toBytes(encryptionKeyHex);
    // Decrypt the value using AES-CTR with the retrieved key
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    const decryptedString = aesjs.utils.utf8.fromBytes(decryptedBytes);
    console.log(`SecureAsyncStorage: Decryption successful for key '${key}'.`);
    return decryptedString;
  }

  async getItem(key: string): Promise<string | null> {
    console.log(`SecureAsyncStorage: Getting item for key '${key}'.`);
    const storedValue = await AsyncStorage.getItem(key);
    if (!storedValue) {
      console.log(
        `SecureAsyncStorage: No stored value found for key '${key}'.`
      );
      return storedValue;
    }
    try {
      // If there's no encryption key, assume the data is legacy unencrypted data.
      const encryptionKeyHex = await SecureStore.getItemAsync(key);
      if (!encryptionKeyHex) {
        console.log(
          `SecureAsyncStorage: Legacy unencrypted data detected for key '${key}'.`
        );
        return storedValue;
      }
      const decrypted = await this._decrypt(key, storedValue);
      console.log(
        `SecureAsyncStorage: Returning decrypted value for key '${key}'.`
      );
      return decrypted;
    } catch (error) {
      console.error(
        `SecureAsyncStorage: Decryption failed for key '${key}'. Possibly legacy unencrypted data is present.`,
        error
      );
      // Optionally, remove the corrupted value here.
      return storedValue;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log(`SecureAsyncStorage: Setting item for key '${key}'.`);
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
    console.log(`SecureAsyncStorage: Value set for key '${key}' (encrypted).`);
  }

  async removeItem(key: string): Promise<void> {
    console.log(`SecureAsyncStorage: Removing item for key '${key}'.`);
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
    console.log(
      `SecureAsyncStorage: Item removed for key '${key}' from both AsyncStorage and SecureStore.`
    );
  }
}

export default SecureAsyncStorage;
