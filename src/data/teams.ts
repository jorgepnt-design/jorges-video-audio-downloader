import type { GroupId, Team } from "../types";

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Replace this file with official FIFA/API data when the confirmed 2026 groups are imported.
// The app intentionally consumes stable IDs so names, groups and fixtures can be swapped later.
const rawTeams: Array<Omit<Team, "groupName">> = [
  { id: "mex", name: "Mexiko", group: "A", flag: "🇲🇽", fifaCode: "MEX" },
  { id: "can", name: "Kanada", group: "A", flag: "🇨🇦", fifaCode: "CAN" },
  { id: "rsa", name: "Südafrika", group: "A", flag: "🇿🇦", fifaCode: "RSA" },
  { id: "jpn", name: "Japan", group: "A", flag: "🇯🇵", fifaCode: "JPN" },
  { id: "usa", name: "USA", group: "B", flag: "🇺🇸", fifaCode: "USA" },
  { id: "ger", name: "Deutschland", group: "B", flag: "🇩🇪", fifaCode: "GER" },
  { id: "gha", name: "Ghana", group: "B", flag: "🇬🇭", fifaCode: "GHA" },
  { id: "qat", name: "Katar", group: "B", flag: "🇶🇦", fifaCode: "QAT" },
  { id: "bra", name: "Brasilien", group: "C", flag: "🇧🇷", fifaCode: "BRA" },
  { id: "mar", name: "Marokko", group: "C", flag: "🇲🇦", fifaCode: "MAR" },
  { id: "sco", name: "Schottland", group: "C", flag: "🏴", fifaCode: "SCO" },
  { id: "egy", name: "Ägypten", group: "C", flag: "🇪🇬", fifaCode: "EGY" },
  { id: "arg", name: "Argentinien", group: "D", flag: "🇦🇷", fifaCode: "ARG" },
  { id: "den", name: "Dänemark", group: "D", flag: "🇩🇰", fifaCode: "DEN" },
  { id: "nga", name: "Nigeria", group: "D", flag: "🇳🇬", fifaCode: "NGA" },
  { id: "nzl", name: "Neuseeland", group: "D", flag: "🇳🇿", fifaCode: "NZL" },
  { id: "esp", name: "Spanien", group: "E", flag: "🇪🇸", fifaCode: "ESP" },
  { id: "uru", name: "Uruguay", group: "E", flag: "🇺🇾", fifaCode: "URU" },
  { id: "kor", name: "Südkorea", group: "E", flag: "🇰🇷", fifaCode: "KOR" },
  { id: "nor", name: "Norwegen", group: "E", flag: "🇳🇴", fifaCode: "NOR" },
  { id: "fra", name: "Frankreich", group: "F", flag: "🇫🇷", fifaCode: "FRA" },
  { id: "sen", name: "Senegal", group: "F", flag: "🇸🇳", fifaCode: "SEN" },
  { id: "par", name: "Paraguay", group: "F", flag: "🇵🇾", fifaCode: "PAR" },
  { id: "aus", name: "Australien", group: "F", flag: "🇦🇺", fifaCode: "AUS" },
  { id: "eng", name: "England", group: "G", flag: "🏴", fifaCode: "ENG" },
  { id: "ned", name: "Niederlande", group: "G", flag: "🇳🇱", fifaCode: "NED" },
  { id: "irn", name: "Iran", group: "G", flag: "🇮🇷", fifaCode: "IRN" },
  { id: "jam", name: "Jamaika", group: "G", flag: "🇯🇲", fifaCode: "JAM" },
  { id: "ita", name: "Italien", group: "H", flag: "🇮🇹", fifaCode: "ITA" },
  { id: "chi", name: "Chile", group: "H", flag: "🇨🇱", fifaCode: "CHI" },
  { id: "tun", name: "Tunesien", group: "H", flag: "🇹🇳", fifaCode: "TUN" },
  { id: "ksa", name: "Saudi-Arabien", group: "H", flag: "🇸🇦", fifaCode: "KSA" },
  { id: "bel", name: "Belgien", group: "I", flag: "🇧🇪", fifaCode: "BEL" },
  { id: "ecu", name: "Ecuador", group: "I", flag: "🇪🇨", fifaCode: "ECU" },
  { id: "cro", name: "Kroatien", group: "I", flag: "🇭🇷", fifaCode: "CRO" },
  { id: "pan", name: "Panama", group: "I", flag: "🇵🇦", fifaCode: "PAN" },
  { id: "sui", name: "Schweiz", group: "J", flag: "🇨🇭", fifaCode: "SUI" },
  { id: "alg", name: "Algerien", group: "J", flag: "🇩🇿", fifaCode: "ALG" },
  { id: "pol", name: "Polen", group: "J", flag: "🇵🇱", fifaCode: "POL" },
  { id: "crc", name: "Costa Rica", group: "J", flag: "🇨🇷", fifaCode: "CRC" },
  { id: "por", name: "Portugal", group: "K", flag: "🇵🇹", fifaCode: "POR" },
  { id: "cod", name: "DR Kongo", group: "K", flag: "🇨🇩", fifaCode: "COD" },
  { id: "uzb", name: "Usbekistan", group: "K", flag: "🇺🇿", fifaCode: "UZB" },
  { id: "col", name: "Kolumbien", group: "K", flag: "🇨🇴", fifaCode: "COL" },
  { id: "aut", name: "Österreich", group: "L", flag: "🇦🇹", fifaCode: "AUT" },
  { id: "srb", name: "Serbien", group: "L", flag: "🇷🇸", fifaCode: "SRB" },
  { id: "tur", name: "Türkei", group: "L", flag: "🇹🇷", fifaCode: "TUR" },
  { id: "per", name: "Peru", group: "L", flag: "🇵🇪", fifaCode: "PER" },
];

export const teams: Team[] = rawTeams.map((team) => ({
  ...team,
  groupName: `Gruppe ${team.group}`,
}));

export const groupIds = Array.from(new Set(teams.map((team) => team.group))) as GroupId[];
