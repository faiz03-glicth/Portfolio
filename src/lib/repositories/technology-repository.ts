import type { TechnologyRow } from "@/lib/supabase/database.types";
import type { Result, Technology } from "@/lib/types";
import { query } from "./base";
import { toTechnology } from "./mappers";

/**
 * Technology reads.
 *
 * Category grouping happens in the UI rather than here: the display order of
 * categories is a presentation decision that lives in `src/data/skills.ts`,
 * and encoding it in a query would put layout knowledge in the data layer.
 */
export const technologyRepository = {
  async findAll(): Promise<Result<Technology[]>> {
    const result = await query<TechnologyRow[]>(
      "technologyRepository.findAll",
      (client) =>
        client
          .from("technologies")
          .select("*")
          .order("category", { ascending: true })
          .order("sort_order", { ascending: true })
          .returns<TechnologyRow[]>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: result.data.map(toTechnology) };
  },
};
