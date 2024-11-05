import crypto from "crypto";

/**
 * Validates the OTP template.
 * @param {string} template - Template to validate.
 * @returns {boolean} - True if the template is valid, false otherwise.
 */
export function validateTemplate(template: string): boolean {
  const validPattern = /^(N{\d+}|L{\d+}|U{\d+}|A{\d+}|M{\d+})+$/;
  return validPattern.test(template);
}

/**
 * Generates an OTP based on a template.
 * @param {string} [template] - Template to generate OTP.
 * @returns {string} - Generated OTP.
 */
export function generateOtp(template: string): string {
  const isValid = validateTemplate(template);

  if (!isValid) {
    throw new Error("Invalid template format");
  }

  const digits = () => Math.floor(Math.random() * 10).toString(); // Generates a random digit
  const lower = () => String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Generates a random lowercase letter
  const upper = () => String.fromCharCode(Math.floor(Math.random() * 26) + 65); // Generates a random uppercase letter

  return template
    .replace(/N{(\d+)}/g, (_, n) => Array.from({ length: n }, digits).join(""))
    .replace(/L{(\d+)}/g, (_, l) => Array.from({ length: l }, lower).join(""))
    .replace(/U{(\d+)}/g, (_, u) => Array.from({ length: u }, upper).join(""));
}

/**
 * Generates a secure secret key with a random length.
 * @returns {string} - A hexadecimal string representation of the generated key.
 */
export function generateSecret(): string {
  const minLength = 16; // bytes
  const maxLength = 32; // bytes

  // Randomly select a length between minLength and maxLength
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  // Generate and return the random key
  return crypto.randomBytes(length).toString("hex");
}
