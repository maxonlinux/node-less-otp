import crypto from "crypto";

/**
 * Generates a random string of digits.
 * @param count - The number of digits to generate.
 * @returns A string of random digits.
 */
function getRandomDigits(count: number): string {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
}

/**
 * Generates a random string of lowercase letters.
 * @param count - The number of letters to generate.
 * @returns A string of random lowercase letters.
 */
function getRandomLowercase(count: number): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return getRandomFromSet(letters, count);
}

/**
 * Generates a random string of uppercase letters.
 * @param count - The number of letters to generate.
 * @returns A string of random uppercase letters.
 */
function getRandomUppercase(count: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return getRandomFromSet(letters, count);
}

/**
 * Generates a random string of mixed-case letters (both lowercase and uppercase).
 * @param count - The number of letters to generate.
 * @returns A string of random mixed-case letters.
 */
function getRandomMixedCase(count: number): string {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return getRandomFromSet(letters, count);
}

/**
 * Generates a random string of alphanumeric characters.
 * @param count - The number of characters to generate.
 * @returns A string of random alphanumeric characters.
 */
function getRandomAlphanumeric(count: number): string {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return getRandomFromSet(characters, count);
}

/**
 * Generates a random string from a given set of characters.
 * @param set - The set of characters to choose from.
 * @param count - The number of characters to generate.
 * @returns A string of random characters from the set.
 */
function getRandomFromSet(set: string, count: number): string {
  return Array.from(
    { length: count },
    () => set[Math.floor(Math.random() * set.length)]
  ).join("");
}

/**
 * Gets the repeat count from the template string.
 * @param template - The OTP template string.
 * @param index - The current index in the template.
 * @returns The number of times to repeat a character.
 */
function getRepeatCount(template: string, index: number): number {
  const match = template.slice(index).match(/\{(\d+)\}/);
  return match ? parseInt(match[1], 10) : 1; // Default to 1 if no count found
}

/**
 * Skips the repeat count in the template string.
 * @param template - The OTP template string.
 * @param index - The current index in the template.
 * @returns The number of characters to skip in the template.
 */
function skipRepeatCount(template: string, index: number): number {
  const match = template.slice(index).match(/\{(\d+)\}/);
  return match ? match[0].length + 2 : 0;
}

/**
 * Validates the OTP template.
 * @param {string} template - Template to validate.
 * @returns {boolean} - True if the template is valid, false otherwise.
 */
function validateTemplate(template: string): boolean {
  const validPattern = /^(N|L|U|A|M)(\{\d+\})?$/; // Pattern for single valid characters with optional repeat counts

  // Split the template by non-characters to process each segment
  const segments = template.split(
    /(?<=[NLUAM])(?=\{)|(?<=[NLUAM]{1})(?=\{)|(?<=\})|(?=[^NLUAM])/
  );

  // Check each segment against the valid pattern
  for (const segment of segments) {
    if (segment && !validPattern.test(segment)) {
      return false; // Invalid segment found
    }
  }

  return true; // All segments are valid
}

/**
 * Generates an OTP based on a template.
 * @param {string} [template] - Template to generate OTP.
 * @returns {string} - Generated OTP.
 */
export function generateOtp(template?: string): string {
  if (!template) {
    // Default to a 6-digit numeric OTP
    return crypto.randomInt(100000, 999999).toString();
  }

  const isTemplateValid = validateTemplate(template);

  if (!isTemplateValid) {
    throw new Error("Invalid template: " + template);
  }

  const charGenerators: Record<string, (count: number) => string> = {
    N: getRandomDigits,
    L: getRandomLowercase,
    U: getRandomUppercase,
    A: getRandomAlphanumeric,
    M: getRandomMixedCase,
  };

  let otp = "";
  let i = 0;

  while (i < template.length) {
    const char = template[i];

    if (charGenerators[char]) {
      const repeatCount = getRepeatCount(template, i); // Get the repeat count for the current character
      otp += charGenerators[char](repeatCount); // Generate characters based on the template
      i += skipRepeatCount(template, i); // Skip past the repeat count in the template
    } else {
      otp += char; // Add any other characters (e.g., separators) directly to the OTP
      i++;
    }
  }

  return otp;
}
