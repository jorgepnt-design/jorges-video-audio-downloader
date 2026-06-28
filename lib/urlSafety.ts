import dns from "node:dns/promises";
import net from "node:net";
import type { Platform } from "./types";

const blockedHosts = new Set(["localhost", "0.0.0.0", "127.0.0.1", "::1"]);

export function detectPlatform(input: string): Platform {
  const host = new URL(input).hostname.replace(/^www\./, "").toLowerCase();

  if (host.includes("instagram.com") || host === "instagr.am" || host === "ig.me") return "Instagram";
  if (host.includes("tiktok.com")) return "TikTok";
  if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
  if (host.includes("twitter.com") || host === "x.com" || host.endsWith(".x.com")) return "X/Twitter";
  if (
    host.includes("facebook.com") ||
    host.includes("fb.watch") ||
    host === "fb.com" ||
    host === "fb.me" ||
    host === "fb.gg"
  ) {
    return "Facebook";
  }
  return "Unbekannt";
}

export async function validatePublicHttpUrl(input: string) {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Bitte gib eine gültige URL ein.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Nur http- und https-Links sind erlaubt.");
  }

  const host = parsed.hostname.toLowerCase();
  if (blockedHosts.has(host) || host.endsWith(".localhost")) {
    throw new Error("Lokale oder interne Adressen sind aus Sicherheitsgründen blockiert.");
  }

  if (isPrivateAddress(host)) {
    throw new Error("Interne IP-Adressen sind aus Sicherheitsgründen blockiert.");
  }

  try {
    const records = await dns.lookup(host, { all: true });
    if (records.some((record) => isPrivateAddress(record.address))) {
      throw new Error("Diese URL verweist auf eine interne Adresse und wurde blockiert.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("blockiert")) throw error;
  }

  return parsed.toString();
}

function isPrivateAddress(address: string) {
  const version = net.isIP(address);
  if (version === 4) {
    const parts = address.split(".").map(Number);
    const [a, b] = parts;
    return (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    );
  }

  if (version === 6) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80");
  }

  return false;
}
