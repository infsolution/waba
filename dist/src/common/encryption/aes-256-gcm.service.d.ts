export declare class Aes256GcmService {
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly authTagLength;
    encrypt(plaintext: string, key: string): {
        ciphertext: string;
        iv: string;
        authTag: string;
    };
    decrypt(ciphertext: string, key: string, iv: string, authTag: string): string;
}
