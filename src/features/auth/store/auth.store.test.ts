import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/features/auth/store/auth.store";

describe("authStore", () => {
  beforeEach(() => useAuthStore.getState().clear());

  it("stores and clears the token", () => {
    expect(useAuthStore.getState().token).toBeNull();

    useAuthStore.getState().setToken("abc.def.ghi");
    expect(useAuthStore.getState().token).toBe("abc.def.ghi");

    useAuthStore.getState().clear();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
