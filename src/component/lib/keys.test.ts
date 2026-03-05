import { describe, expect, it } from "vitest";
import { generateApiKey, hashApiKey } from "./keys";

describe("generateApiKey", () => {
  it("starts with rl_ak_ and is 68 chars long", () => {
    const key = generateApiKey();
    expect(key.startsWith("rl_ak_")).toBe(true);
    expect(key).toHaveLength(70); // "rl_ak_" (6) + 64 hex chars
  });

  it("generates unique keys", () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1).not.toBe(key2);
  });
});

describe("hashApiKey", () => {
  it("returns a deterministic 64-char hex string", async () => {
    const hash1 = await hashApiKey("rl_ak_test123");
    const hash2 = await hashApiKey("rl_ak_test123");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(hash1)).toBe(true);
  });

  it("produces different hashes for different keys", async () => {
    const hash1 = await hashApiKey("rl_ak_aaa");
    const hash2 = await hashApiKey("rl_ak_bbb");
    expect(hash1).not.toBe(hash2);
  });
});
