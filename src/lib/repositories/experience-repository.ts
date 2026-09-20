import type { ExperienceRow } from "@/lib/supabase/database.types";
import type { Experience, Result } from "@/lib/types";
import { query } from "./base";
import { toExperience } from "./mappers";

/** Experience reads, ordered most recent first. */
export const experienceRepository = {
  async findAll(): Promise<Result<Experience[]>> {
    const result = await query<ExperienceRow[]>(
      "experienceRepository.findAll",
      (client) =>
        client
          .from("experiences")
          .select("*")
          .order("sort_order", { ascending: false })
          .order("start_date", { ascending: false })
          .returns<ExperienceRow[]>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: result.data.map(toExperience) };
  },
};
