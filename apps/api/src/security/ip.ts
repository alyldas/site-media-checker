interface CidrRange {
  base: number;
  mask: number;
}

interface Ipv6CidrRange {
  base: bigint;
  mask: bigint;
}

const BLOCKED_IPV4_RANGES: CidrRange[] = [
  cidr("0.0.0.0", 8),
  cidr("10.0.0.0", 8),
  cidr("100.64.0.0", 10),
  cidr("127.0.0.0", 8),
  cidr("169.254.0.0", 16),
  cidr("172.16.0.0", 12),
  cidr("192.0.0.0", 24),
  cidr("192.0.2.0", 24),
  cidr("192.168.0.0", 16),
  cidr("198.18.0.0", 15),
  cidr("198.51.100.0", 24),
  cidr("203.0.113.0", 24),
  cidr("224.0.0.0", 4),
  cidr("240.0.0.0", 4),
  cidr("255.255.255.255", 32),
];

const BLOCKED_IPV6_RANGES: Ipv6CidrRange[] = [
  ipv6Cidr("::", 128),
  ipv6Cidr("::1", 128),
  ipv6Cidr("::ffff:0:0", 96),
  ipv6Cidr("64:ff9b::", 96),
  ipv6Cidr("100::", 64),
  ipv6Cidr("2001::", 23),
  ipv6Cidr("2001:2::", 48),
  ipv6Cidr("2001:10::", 28),
  ipv6Cidr("2001:db8::", 32),
  ipv6Cidr("fc00::", 7),
  ipv6Cidr("fe80::", 10),
  ipv6Cidr("ff00::", 8),
];

export function isBlockedIpAddress(address: string): boolean {
  if (isBlockedIpv4(address)) {
    return true;
  }

  return isBlockedIpv6(address);
}

function isBlockedIpv4(address: string): boolean {
  const value = parseIpv4(address);

  if (value === null) {
    return false;
  }

  return BLOCKED_IPV4_RANGES.some((range) =>
    (value & range.mask) === range.base
  );
}

function parseIpv4(address: string): number | null {
  const parts = address.split(".");

  if (parts.length !== 4) {
    return null;
  }

  let value = 0;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return null;
    }

    const octet = Number.parseInt(part, 10);

    if (octet < 0 || octet > 255) {
      return null;
    }

    value = (value << 8) | octet;
  }

  return value >>> 0;
}

function cidr(baseAddress: string, bits: number): CidrRange {
  const base = parseIpv4(baseAddress);

  if (base === null) {
    throw new Error(`Invalid IPv4 CIDR base: ${baseAddress}`);
  }

  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;

  return {
    base: base & mask,
    mask,
  };
}

function isBlockedIpv6(address: string): boolean {
  const normalized = normalizeIpv6Address(address);

  if (!normalized) {
    return false;
  }

  const ipv4Mapped = embeddedIpv4Address(normalized);
  if (ipv4Mapped !== null && isBlockedIpv4(ipv4Mapped)) {
    return true;
  }

  const value = parseNormalizedIpv6(normalized);

  return value !== null &&
    BLOCKED_IPV6_RANGES.some((range) =>
      (value & range.mask) === range.base
    );
}

function normalizeIpv6Address(address: string): string | null {
  const normalized = address.toLowerCase();

  if (!normalized.includes(":")) {
    return null;
  }

  const [head = "", tail = ""] = normalized.split("::");
  if (normalized.split("::").length > 2) {
    return null;
  }

  const headParts = splitIpv6Part(head);
  const tailParts = splitIpv6Part(tail);

  if (headParts === null || tailParts === null) {
    return null;
  }

  const missing = normalized.includes("::")
    ? 8 - headParts.length - tailParts.length
    : 0;

  if (missing < 0 || (!normalized.includes("::") && headParts.length !== 8)) {
    return null;
  }

  return [...headParts, ...Array(missing).fill("0"), ...tailParts]
    .map((part) => Number.parseInt(part, 16).toString(16))
    .join(":");
}

function splitIpv6Part(part: string): string[] | null {
  if (!part) {
    return [];
  }

  const pieces = part.split(":");
  const result: string[] = [];

  for (const [index, piece] of pieces.entries()) {
    if (piece.includes(".")) {
      if (index !== pieces.length - 1) {
        return null;
      }

      const ipv4 = parseIpv4(piece);
      if (ipv4 === null) {
        return null;
      }

      result.push(
        ((ipv4 >>> 16) & 0xffff).toString(16),
        (ipv4 & 0xffff).toString(16),
      );
      continue;
    }

    if (!/^[0-9a-f]{1,4}$/.test(piece)) {
      return null;
    }

    result.push(piece);
  }

  return result;
}

function ipv6Cidr(baseAddress: string, bits: number): Ipv6CidrRange {
  const normalized = normalizeIpv6Address(baseAddress);
  const base = normalized ? parseNormalizedIpv6(normalized) : null;

  if (base === null) {
    throw new Error(`Invalid IPv6 CIDR base: ${baseAddress}`);
  }

  const mask = bits === 0
    ? 0n
    : ((1n << BigInt(bits)) - 1n) << BigInt(128 - bits);

  return {
    base: base & mask,
    mask,
  };
}

function parseNormalizedIpv6(normalizedIpv6: string): bigint | null {
  const parts = normalizedIpv6.split(":");

  if (parts.length !== 8) {
    return null;
  }

  let value = 0n;
  for (const part of parts) {
    const hextet = Number.parseInt(part, 16);

    if (!Number.isFinite(hextet) || hextet < 0 || hextet > 0xffff) {
      return null;
    }

    value = (value << 16n) | BigInt(hextet);
  }

  return value;
}

function embeddedIpv4Address(normalizedIpv6: string): string | null {
  const parts = normalizedIpv6.split(":");

  if (parts.length !== 8) {
    return null;
  }

  const isIpv4Compatible = parts.slice(0, 6).every((part) => part === "0");
  const isIpv4Mapped = parts.slice(0, 5).every((part) => part === "0") &&
    parts[5] === "ffff";
  const isNat64 = parts[0] === "64" && parts[1] === "ff9b" &&
    parts.slice(2, 6).every((part) => part === "0");
  const is6To4 = parts[0] === "2002";

  if (!isIpv4Compatible && !isIpv4Mapped && !isNat64 && !is6To4) {
    return null;
  }

  if (is6To4) {
    const high = Number.parseInt(parts[1] ?? "", 16);
    const low = Number.parseInt(parts[2] ?? "", 16);

    if (!Number.isFinite(high) || !Number.isFinite(low)) {
      return null;
    }

    return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
  }

  const high = Number.parseInt(parts[6] ?? "", 16);
  const low = Number.parseInt(parts[7] ?? "", 16);

  if (!Number.isFinite(high) || !Number.isFinite(low)) {
    return null;
  }

  return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
}
