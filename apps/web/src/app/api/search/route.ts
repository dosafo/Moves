import { parseSearchQuery } from "@/lib/search/parseSearchQuery";
import { searchPlaces } from "@/lib/search/searchPlaces";

/**
 * GET /api/search
 *
 * URL contract:
 *   ?q=afrobeats
 *   &vibe=energetic&vibe=social        (repeat for multi)
 *   &music=afrobeats
 *   &category=club
 *   &neighborhood=Logan%20Square
 *   &pricePreference=cheap
 *
 * This handler is intentionally tiny: parse URL → call service → JSON out.
 * All filtering / scoring / intent logic lives one layer down so the same
 * service can be called by the server-rendered page.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = parseSearchQuery(url.searchParams);
  const response = await searchPlaces(query);
  return Response.json(response);
}
