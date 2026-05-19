import type { Stadium } from "../types";

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Stadium names are structured centrally so fixture imports can map to a known venue ID later.
export const stadiums: Stadium[] = [
  { id: "metlife", name: "New York New Jersey Stadium", city: "New York/New Jersey", country: "USA" },
  { id: "dallas", name: "Dallas Stadium", city: "Dallas", country: "USA" },
  { id: "la", name: "Los Angeles Stadium", city: "Los Angeles", country: "USA" },
  { id: "atlanta", name: "Atlanta Stadium", city: "Atlanta", country: "USA" },
  { id: "azteca", name: "Mexico City Stadium", city: "Mexico City", country: "Mexico" },
  { id: "toronto", name: "Toronto Stadium", city: "Toronto", country: "Canada" },
  { id: "vancouver", name: "Vancouver Stadium", city: "Vancouver", country: "Canada" },
  { id: "houston", name: "Houston Stadium", city: "Houston", country: "USA" },
  { id: "bay-area", name: "Bay Area Stadium", city: "San Francisco Bay Area", country: "USA" },
  { id: "philadelphia", name: "Philadelphia Stadium", city: "Philadelphia", country: "USA" },
  { id: "seattle", name: "Seattle Stadium", city: "Seattle", country: "USA" },
  { id: "miami", name: "Miami Stadium", city: "Miami", country: "USA" },
];
