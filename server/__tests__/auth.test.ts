import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { hashPassword, verifyPassword } from "../replit_integrations/auth/replitAuth";
import { authStorage } from "../replit_integrations/auth/storage";
import { pool } from "../db";

describe("Master Auth Flow - Unit Tests", () => {
  // Check if we have a DB connection for integration tests
  const hasDB = !!process.env.DATABASE_URL;

  test("should hash and verify password correctly with bcrypt", async () => {
    const password = "Password123!";
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2b$")).toBe(true); // bcrypt default prefix
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await verifyPassword("WrongPassword", hash);
    expect(isInvalid).toBe(false);
  });

  test("should fail verification with malformed hash", async () => {
    const isValid = await verifyPassword("any", "not-a-hash");
    expect(isValid).toBe(false);
  });

  if (hasDB) {
    test("integration: should fetch user by email", async () => {
      const user = await authStorage.getUserByEmail("master@vhub.com.br");
      if (user) {
        expect(user.email).toBe("master@vhub.com.br");
        expect(user.role).toBe("MASTER");
      }
    });
  }
});
