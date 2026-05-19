import type { GroupId, Team } from "../types";

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Replace this file with official FIFA/API data when the confirmed 2026 groups are imported.
// The app intentionally consumes stable IDs so names, groups and fixtures can be swapped later.
const rawTeams: Array<Omit<Team, "groupName">> = [
  { id: "mex", name: "Mexico", group: "A", flag: "🇲🇽", fifaCode: "MEX" },
  { id: "can", name: "Canada", group: "A", flag: "🇨🇦", fifaCode: "CAN" },
  { id: "rsa", name: "South Africa", group: "A", flag: "🇿🇦", fifaCode: "RSA" },
  { id: "jpn", name: "Japan", group: "A", flag: "🇯🇵", fifaCode: "JPN" },
  { id: "usa", name: "USA", group: "B", flag: "🇺🇸", fifaCode: "USA" },
  { id: "ger", name: "Germany", group: "B", flag: "🇩🇪", fifaCode: "GER" },
  { id: "gha", name: "Ghana", group: "B", flag: "🇬🇭", fifaCode: "GHA" },
  { id: "qat", name: "Qatar", group: "B", flag: "🇶🇦", fifaCode: "QAT" },
  { id: "bra", name: "Brazil", group: "C", flag: "🇧🇷", fifaCode: "BRA" },
  { id: "mar", name: "Morocco", group: "C", flag: "🇲🇦", fifaCode: "MAR" },
  { id: "sco", name: "Scotland", group: "C", flag: "🏴", fifaCode: "SCO" },
  { id: "egy", name: "Egypt", group: "C", flag: "🇪🇬", fifaCode: "EGY" },
  { id: "arg", name: "Argentina", group: "D", flag: "🇦🇷", fifaCode: "ARG" },
  { id: "den", name: "Denmark", group: "D", flag: "🇩🇰", fifaCode: "DEN" },
  { id: "nga", name: "Nigeria", group: "D", flag: "🇳🇬", fifaCode: "NGA" },
  { id: "nzl", name: "New Zealand", group: "D", flag: "🇳🇿", fifaCode: "NZL" },
  { id: "esp", name: "Spain", group: "E", flag: "🇪🇸", fifaCode: "ESP" },
  { id: "uru", name: "Uruguay", group: "E", flag: "🇺🇾", fifaCode: "URU" },
  { id: "kor", name: "Korea Republic", group: "E", flag: "🇰🇷", fifaCode: "KOR" },
  { id: "nor", name: "Norway", group: "E", flag: "🇳🇴", fifaCode: "NOR" },
  { id: "fra", name: "France", group: "F", flag: "🇫🇷", fifaCode: "FRA" },
  { id: "sen", name: "Senegal", group: "F", flag: "🇸🇳", fifaCode: "SEN" },
  { id: "par", name: "Paraguay", group: "F", flag: "🇵🇾", fifaCode: "PAR" },
  { id: "aus", name: "Australia", group: "F", flag: "🇦🇺", fifaCode: "AUS" },
  { id: "eng", name: "England", group: "G", flag: "🏴", fifaCode: "ENG" },
  { id: "ned", name: "Netherlands", group: "G", flag: "🇳🇱", fifaCode: "NED" },
  { id: "irn", name: "Iran", group: "G", flag: "🇮🇷", fifaCode: "IRN" },
  { id: "jam", name: "Jamaica", group: "G", flag: "🇯🇲", fifaCode: "JAM" },
  { id: "ita", name: "Italy", group: "H", flag: "🇮🇹", fifaCode: "ITA" },
  { id: "chi", name: "Chile", group: "H", flag: "🇨🇱", fifaCode: "CHI" },
  { id: "tun", name: "Tunisia", group: "H", flag: "🇹🇳", fifaCode: "TUN" },
  { id: "ksa", name: "Saudi Arabia", group: "H", flag: "🇸🇦", fifaCode: "KSA" },
  { id: "bel", name: "Belgium", group: "I", flag: "🇧🇪", fifaCode: "BEL" },
  { id: "ecu", name: "Ecuador", group: "I", flag: "🇪🇨", fifaCode: "ECU" },
  { id: "cro", name: "Croatia", group: "I", flag: "🇭🇷", fifaCode: "CRO" },
  { id: "pan", name: "Panama", group: "I", flag: "🇵🇦", fifaCode: "PAN" },
  { id: "sui", name: "Switzerland", group: "J", flag: "🇨🇭", fifaCode: "SUI" },
  { id: "alg", name: "Algeria", group: "J", flag: "🇩🇿", fifaCode: "ALG" },
  { id: "pol", name: "Poland", group: "J", flag: "🇵🇱", fifaCode: "POL" },
  { id: "crc", name: "Costa Rica", group: "J", flag: "🇨🇷", fifaCode: "CRC" },
  { id: "por", name: "Portugal", group: "K", flag: "🇵🇹", fifaCode: "POR" },
  { id: "cod", name: "DR Congo", group: "K", flag: "🇨🇩", fifaCode: "COD" },
  { id: "uzb", name: "Uzbekistan", group: "K", flag: "🇺🇿", fifaCode: "UZB" },
  { id: "col", name: "Colombia", group: "K", flag: "🇨🇴", fifaCode: "COL" },
  { id: "aut", name: "Austria", group: "L", flag: "🇦🇹", fifaCode: "AUT" },
  { id: "srb", name: "Serbia", group: "L", flag: "🇷🇸", fifaCode: "SRB" },
  { id: "tur", name: "Turkiye", group: "L", flag: "🇹🇷", fifaCode: "TUR" },
  { id: "per", name: "Peru", group: "L", flag: "🇵🇪", fifaCode: "PER" },
];

export const teams: Team[] = rawTeams.map((team) => ({
  ...team,
  groupName: `Gruppe ${team.group}`,
}));

export const groupIds = Array.from(new Set(teams.map((team) => team.group))) as GroupId[];
