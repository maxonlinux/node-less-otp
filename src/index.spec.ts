import { LessOtp } from "./index";
import { describe, it, expect, beforeEach } from "vitest";

describe("LessOtp", () => {
  let lessOtp: LessOtp;
  const id = "test@example.com";

  beforeEach(() => {
    lessOtp = new LessOtp({ secretSalt: "testSecretSalt", enableSet: true });
  });

  it("should generate an OTP and corresponding hash", async () => {
    const { otp, hash } = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    expect(otp).toHaveLength(6);
    expect(hash).toBeDefined();
  });

  it("should verify a valid OTP", async () => {
    const { otp, hash } = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    const isValid = lessOtp.verify(id, hash, otp);
    expect(isValid).toBe(true);
  });

  it("should not verify an expired OTP", async () => {
    const { otp, hash } = lessOtp.gen(id, { template: "N{6}", ttl: 0 }); // ttl 0 to expire immediately
    const isValid = lessOtp.verify(id, hash, otp);
    expect(isValid).toBe(false);
  });

  it("should not verify an OTP that has been used once already", async () => {
    const { otp, hash } = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    expect(lessOtp.verify(id, hash, otp)).toBe(true); // First usage
    expect(lessOtp.verify(id, hash, otp)).toBe(false); // Second usage should fail
  });

  // it("should generate a random secret if not provided", () => {
  //   const lessOtpNoSecret = new LessOtp({});
  //   expect(lessOtpNoSecret.secretSalt).toBeDefined();
  //   expect(lessOtpNoSecret.secretSalt.length).toBeGreaterThanOrEqual(32);
  //   expect(lessOtpNoSecret.secretSalt.length).toBeLessThanOrEqual(64);
  // });

  it("should generate OTP of varying lengths according to the template", async () => {
    const otp4 = lessOtp.gen(id, { template: "N{4}", ttl: 60 });
    expect(otp4.otp).toHaveLength(4);

    const otp8 = lessOtp.gen(id, { template: "N{8}", ttl: 60 });
    expect(otp8.otp).toHaveLength(8);
  });

  it("should throw an error for an invalid template format", async () => {
    await expect(
      lessOtp.gen(id, { template: "invalid-template", ttl: 60 })
    ).rejects.toThrow("Invalid template format");
  });

  it("should correctly handle template with letters and numbers", async () => {
    const { otp } = lessOtp.gen(id, {
      template: "N{4}L{2}U{2}",
      ttl: 60,
    });
    expect(otp).toMatch(/^\d{4}[a-z]{2}[A-Z]{2}$/);
  });

  it("should not verify an OTP if the hash is tampered with", async () => {
    const { otp, hash } = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    const tamperedHash = hash.slice(0, -1) + "X"; // Slightly change the hash
    const isValid = lessOtp.verify(id, tamperedHash, otp);
    expect(isValid).toBe(false);
  });

  it("should generate a different OTP on each call", async () => {
    const otp1 = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    const otp2 = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    expect(otp1.otp).not.toBe(otp2.otp);
  });

  it("should reject verification if OTP is incorrect", async () => {
    const { otp, hash } = lessOtp.gen(id, { template: "N{6}", ttl: 60 });
    const isValid = lessOtp.verify(id, hash, otp.slice(0, -1) + "9"); // Modify OTP slightly
    expect(isValid).toBe(false);
  });
});
