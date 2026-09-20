import type { ProfileRow } from "@/lib/supabase/database.types";
import type { Profile, Result } from "@/lib/types";
import { query } from "./base";
import { toProfile } from "./mappers";

/**
 * Profile reads.
 *
 * The table is expected to hold exactly one active row — a partial unique
 * index in migration 0001 enforces that — so `.single()` here is a correctness
 * assertion, not an optimistic guess.
 */
export const profileRepository = {
  async findActive(): Promise<Result<Profile>> {
    const result = await query<ProfileRow>(
      "profileRepository.findActive",
      (client) =>
        client
          .from("profiles")
          .select("*")
          .eq("is_active", true)
          .single<ProfileRow>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: toProfile(result.data) };
  },
};
