interface CidrRange {
  base: number;
  mask: number;
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
  const normalized = address.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("::ffff:") ||
    normalized.startsWith("64:ff9b:") ||
    normalized === "100::" ||
    normalized.startsWith("100:0:") ||
    normalized.startsWith("2001:0") ||
    normalized.startsWith("2001:1") ||
    normalized.startsWith("2001:db8") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff")
  );
}
