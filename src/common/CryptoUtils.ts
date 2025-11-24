import CryptoJS from "crypto-js";

// Get WordArray type from CryptoJS
type WordArray = CryptoJS.lib.WordArray;

export const encryptCBC = (
  plaintext: string,
  key: WordArray,
  iv: WordArray
): string => {
  return CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
  }).toString();
};

export const decryptCBC = (
  ciphertext: string,
  key: WordArray,
  iv: WordArray
): string => {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};
