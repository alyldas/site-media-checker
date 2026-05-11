import type { ApiConfig } from "../utils/config.ts";
import type { ErrorCode } from "../../../../packages/core/src/types.ts";
import { isBlockedIpAddress } from "./ip.ts";

export class SsrfError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SsrfError";
  }
}

export async function assertPublicHttpUrl(
  urlValue: string,
  config: ApiConfig,
): Promise<void> {
  const url = new URL(urlValue);
  const hostname = normalizeHostname(url.hostname);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfError(
      "unsupported_protocol",
      "Only http and https URLs are supported",
    );
  }

  if (!hostname) {
    throw new SsrfError("invalid_hostname", "URL hostname is required");
  }

  if (url.username || url.password) {
    throw new SsrfError(
      "userinfo_not_allowed",
      "URLs with username or password are not allowed",
    );
  }

  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new SsrfError(
      "port_not_allowed",
      "Only default HTTP and HTTPS ports are allowed",
    );
  }

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new SsrfError(
      "blocked_private_address",
      "Localhost URLs are not allowed",
    );
  }

  if (isBlockedIpAddress(hostname)) {
    throw new SsrfError(
      "blocked_private_address",
      "Private, local or reserved IP addresses are not allowed",
    );
  }

  await assertDnsResolvesToPublicAddresses(hostname, config);
}

async function assertDnsResolvesToPublicAddresses(
  hostname: string,
  config: ApiConfig,
): Promise<void> {
  if (isIpLiteral(hostname)) {
    return;
  }

  const addresses = await resolveDnsAddresses(hostname, config);

  if (addresses.length === 0) {
    if (config.allowUnsafeDnsFallback) {
      return;
    }

    throw new SsrfError(
      "dns_resolution_failed",
      "Hostname did not resolve to any A or AAAA address",
    );
  }

  for (const address of addresses) {
    if (isBlockedIpAddress(address)) {
      throw new SsrfError(
        "blocked_private_address",
        "Hostname resolves to a private, local or reserved IP address",
      );
    }
  }
}

async function resolveDnsAddresses(
  hostname: string,
  config: ApiConfig,
): Promise<string[]> {
  try {
    const [aRecords, aaaaRecords] = await Promise.allSettled([
      Deno.resolveDns(hostname, "A"),
      Deno.resolveDns(hostname, "AAAA"),
    ]);

    const addresses = [
      ...(aRecords.status === "fulfilled" ? aRecords.value : []),
      ...(aaaaRecords.status === "fulfilled" ? aaaaRecords.value : []),
    ];

    if (addresses.length > 0) {
      return addresses;
    }
  } catch {
    // The fallback decision is handled below.
  }

  if (config.allowUnsafeDnsFallback) {
    return [];
  }

  throw new SsrfError("dns_resolution_failed", "DNS resolution failed");
}

function isIpLiteral(hostname: string): boolean {
  return isBlockedIpAddress(hostname) ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.includes(":");
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}
