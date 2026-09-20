import type { SocialLinkRow } from "@/lib/supabase/database.types";
import type { Result, SocialLink } from "@/lib/types";
import { query } from "./base";
import { toSocialLink } from "./mappers";

/**
 * Social link reads.
 *
 * The `is_visible` filter is also enforced by the RLS policy, so a hidden link
 * is unreachable through the anon key even if this filter were removed. The
 * duplication is deliberate: the query states the intent, the policy enforces
 * it.
 */
export const socialLinkRepository = {
  async findVisible(): Promise<Result<SocialLink[]>> {
    const result = await query<SocialLinkRow[]>(
      "socialLinkRepository.findVisible",
      (client) =>
        client
          .from("social_links")
          .select("*")
          .eq("is_visible", true)
          .order("sort_order", { ascending: true })
          .returns<SocialLinkRow[]>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: result.data.map(toSocialLink) };
  },
};
