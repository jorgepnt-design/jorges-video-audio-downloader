import type { Stadium } from "../types";

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Venue names are structured centrally so fixture imports can map to a known venue ID later.
export const stadiums: Stadium[] = [
  { id: "metlife", name: "New York New Jersey Stadion", city: "New York/New Jersey", country: "USA" },
  { id: "dallas", name: "Dallas Stadion", city: "Dallas", country: "USA" },
  { id: "la", name: "Los Angeles Stadion", city: "Los Angeles", country: "USA" },
  { id: "atlanta", name: "Atlanta Stadion", city: "Atlanta", country: "USA" },
  { id: "azteca", name: "Mexiko-Stadt Stadion", city: "Mexiko-Stadt", country: "Mexiko" },
  { id: "toronto", name: "Toronto Stadion", city: "Toronto", country: "Kanada" },
  { id: "vancouver", name: "Vancouver Stadion", city: "Vancouver", country: "Kanada" },
  { id: "houston", name: "Houston Stadion", city: "Houston", country: "USA" },
  { id: "bay-area", name: "Bay Area Stadion", city: "San Francisco Bay Area", country: "USA" },
  { id: "philadelphia", name: "Philadelphia Stadion", city: "Philadelphia", country: "USA" },
  { id: "seattle", name: "Seattle Stadion", city: "Seattle", country: "USA" },
  { id: "miami", name: "Miami Stadion", city: "Miami", country: "USA" },
];
