import crypto from "crypto";
import { generateOtp } from "./utils";

// Constants for encryption
const DEFAULT_ALGORITHM = "aes-256-cbc";
const DEFAULT_IV_LENGTH = 16;

type LessOtpConfig = {
  /** Mandatory secret salt used for encryption. */
  secretSalt: string;

  /** Optional encryption algorithm (default is 'aes-256-cbc') */
  algorithm?: string;

  /** Optional initialization vector length (default is 16) */
  ivLength?: number;
};

type GenerateOptions = {
  /**
   * Optional template for OTP generation using a structured string format (defaults to 6 random digits e.g. 491945):
   * - 'N' for numeric (0-9)
   * - 'L' for lowercase letters (a-z)
   * - 'U' for uppercase letters (A-Z)
   * - 'A' for alphanumeric characters (0-9, a-z, A-Z)
   * - 'M' for mixed-case letters (both a-z and A-Z)
   * - 'N{3}' for a group of 3 random digits
   * - 'M{4}' for a group of 4 random mixed-case letters
   * - Groups can be combined with separators (e.g., '-') or any other characters.
   *
   * @example
   * // Generates OTP of format 'M{3}-N{3}' (e.g., 'aBc-123')
   * const otp = lessOtp.gen("user@example.com", { template: 'M{3}-N{3}' });
   * console.log(otp); // Output: { otp: 'aBc-123', hash: '...', expiresAt: <timestamp> }
   *
   * @example
   * // Generates OTP of format 'L{3}-M{2}' (e.g., 'abc-CD')
   * const otp = lessOtp.gen("user@example.com", { template: 'L{3}-M{2}' });
   * console.log(otp); // Output: { otp: 'abc-CD', hash: '...', expiresAt: <timestamp> }
   *
   * @example
   * // Generates OTP of format 'A{4}' (e.g., '1aB2')
   * const otp = lessOtp.gen("user@example.com", { template: 'A{4}' });
   * console.log(otp); // Output: { otp: '1aB2', hash: '...', expiresAt: <timestamp> }
   *
   * @example
   * // Generates OTP of format 'N{2}-M{2}-U{2}' (e.g., '12-ab-XY')
   * const otp = lessOtp.gen("user@example.com", { template: 'N{2}-M{2}-U{2}' });
   * console.log(otp); // Output: { otp: '12-ab-XY', hash: '...', expiresAt: <timestamp> }
   */
  template?: string;

  /** Optional time-to-live in seconds for the generated OTP. Defaults to Infinity (unlimited) (not recommended) */
  ttl?: number;
};

type Data = {
  otp: string;
  expiresAt: number;
};

class LessOtp {
  private secretSalt: string;
  private algorithm: string;
  private ivLength: number;

  constructor(config: LessOtpConfig) {
    this.secretSalt = config.secretSalt;
    this.algorithm = config.algorithm || DEFAULT_ALGORITHM;
    this.ivLength = config.ivLength || DEFAULT_IV_LENGTH;
  }

  /**
   * Generates an OTP using a template (regex) or custom function.
   * @param {string} id - Unique identifier (e.g., phone, email, username, etc.).
   * @param {GenerateOptions} options - Options for OTP generation.
   * @returns {Object} - OTP and hash.
   */
  public async gen(
    id: string,
    options: GenerateOptions = {}
  ): Promise<{ otp: string; hash: string }> {
    const otp = generateOtp(options.template);

    const expiresAt = options.ttl ? Date.now() + options.ttl * 1000 : Infinity; // Infinity for unlimited TTL

    // Stringified object with OTP and expiration to be encripted
    const data = JSON.stringify({
      otp,
      expiresAt,
    });

    // Encrypt OTP data
    const hash = this.encryptOtp(id, data);

    return { otp, hash };
  }

  /**
   * Verifies the OTP by comparing it with the decrypted OTP hash.
   * @param {string} id - Unique identifier.
   * @param {string} data - Data to verify.
   * @param {string} hash - Encrypted OTP hash.
   * @returns {boolean} - Whether the OTP is valid.
   */
  public verify(id: string, hash: string, data: Data): boolean {
    const { otp, expiresAt } = this.decryptOtp(hash, id);

    // Check if the OTP is valid based on expiration
    if (Date.now() > expiresAt) {
      return false;
    }

    return otp === data.otp;
  }

  /**
   * Encrypts the OTP using the identifier as a key.
   * @param {string} payload - String to encrypt (e.g. stringified object with OTP and expiration).
   * @param {string} id - Unique identifier used as encryption key.
   * @returns {string} - Encrypted OTP hash.
   */
  private encryptOtp(id: string, payload: string): string {
    const key = this.deriveKey(id);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const encrypted =
      cipher.update(payload, "utf8", "hex") + cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypts the OTP hash using the identifier.
   * @param {string} hash - Encrypted OTP hash.
   * @param {string} id - Unique identifier used for decryption.
   * @returns {string} - Decrypted object with OTP and expiration.
   */
  private decryptOtp(hash: string, id: string): Data {
    const key = this.deriveKey(id);
    const [ivHex, encryptedText] = hash.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    const decrypted =
      decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8");

    return JSON.parse(decrypted);
  }

  /**
   * Derives a key from the identifier using SHA-256.
   * @param {string} id - Identifier to derive key from.
   * @returns {Buffer} - Derived key.
   */
  private deriveKey(id: string): Buffer {
    return crypto
      .createHash("sha256")
      .update(this.secretSalt + id)
      .digest();
  }
}

export default LessOtp;
