import { describe, it, expect } from "vitest";
import { generateOtp, generateSecret, validateTemplate } from "./utils";

describe("OTP Generation and Validation", () => {
  describe("validateTemplate", () => {
    it("should return true for valid templates", () => {
      const validTemplates = ["N{4}", "L{2}", "U{3}", "N{3}L{2}U{1}", "A{5}"];
      validTemplates.forEach((template) => {
        expect(validateTemplate(template)).toBe(true);
      });
    });

    it("should return false for invalid templates", () => {
      const invalidTemplates = ["N{2}Z{3}", "N{4}L"];
      invalidTemplates.forEach((template) => {
        expect(validateTemplate(template)).toBe(false);
      });
    });
  });

  describe("generateOtp", () => {
    it("should generate a valid OTP for a valid template", () => {
      const template = "N{4}L{2}U{2}";
      const otp = generateOtp(template);
      expect(otp).toMatch(/^\d{4}[a-z]{2}[A-Z]{2}$/);
    });

    it("should throw an error for an invalid template", () => {
      const invalidTemplate = "invalid-template";
      expect(() => generateOtp(invalidTemplate)).toThrow(
        "Invalid template format"
      );
    });
  });

  describe("generateSecret", () => {
    it("should generate a secret of random length between 32 and 64 characters", () => {
      const secret = generateSecret();
      const length = secret.length;

      expect(length).toBeGreaterThanOrEqual(32); // Minimum length (16 bytes * 2)
      expect(length).toBeLessThanOrEqual(64); // Maximum length (32 bytes * 2)
      expect(secret).toMatch(/[0-9a-f]+$/); // Hexadecimal string check
    });
  });
});
