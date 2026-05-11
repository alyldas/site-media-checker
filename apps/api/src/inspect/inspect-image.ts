export interface ImageMetadata {
  format: "png" | "jpeg" | "gif" | "webp" | "svg" | "ico" | "unknown";
  width: number | null;
  height: number | null;
  sizes?: Array<{ width: number; height: number }>;
  warning?: string;
}

const decoder = new TextDecoder();

export function inspectImage(
  bytes: Uint8Array,
  contentType: string | null,
): ImageMetadata {
  return (
    inspectPng(bytes) ??
      inspectJpeg(bytes) ??
      inspectGif(bytes) ??
      inspectWebp(bytes) ??
      inspectIco(bytes) ??
      inspectSvg(bytes, contentType) ?? {
      format: "unknown",
      width: null,
      height: null,
      warning: "Image dimensions could not be detected",
    }
  );
}

function inspectPng(bytes: Uint8Array): ImageMetadata | null {
  if (
    bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e || bytes[3] !== 0x47
  ) {
    return null;
  }

  return {
    format: "png",
    width: readUint32(bytes, 16),
    height: readUint32(bytes, 20),
  };
}

function inspectJpeg(bytes: Uint8Array): ImageMetadata | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    const length = readUint16(bytes, offset + 2);

    if (
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    ) {
      return {
        format: "jpeg",
        height: readUint16(bytes, offset + 5),
        width: readUint16(bytes, offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function inspectGif(bytes: Uint8Array): ImageMetadata | null {
  const header = decoder.decode(bytes.slice(0, 6));
  if (header !== "GIF87a" && header !== "GIF89a") {
    return null;
  }

  return {
    format: "gif",
    width: readUint16Le(bytes, 6),
    height: readUint16Le(bytes, 8),
  };
}

function inspectWebp(bytes: Uint8Array): ImageMetadata | null {
  if (
    bytes.length < 30 || decoder.decode(bytes.slice(0, 4)) !== "RIFF" ||
    decoder.decode(bytes.slice(8, 12)) !== "WEBP"
  ) {
    return null;
  }

  const chunk = decoder.decode(bytes.slice(12, 16));

  if (chunk === "VP8X") {
    return {
      format: "webp",
      width: readUint24Le(bytes, 24) + 1,
      height: readUint24Le(bytes, 27) + 1,
    };
  }

  if (chunk === "VP8L") {
    const b0 = bytes[21] ?? 0;
    const b1 = bytes[22] ?? 0;
    const b2 = bytes[23] ?? 0;
    const b3 = bytes[24] ?? 0;
    return {
      format: "webp",
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }

  return null;
}

function inspectIco(bytes: Uint8Array): ImageMetadata | null {
  if (
    bytes.length < 6 || readUint16Le(bytes, 0) !== 0 ||
    readUint16Le(bytes, 2) !== 1
  ) {
    return null;
  }

  const count = readUint16Le(bytes, 4);
  const sizes: Array<{ width: number; height: number }> = [];

  for (let index = 0; index < count; index += 1) {
    const offset = 6 + index * 16;
    if (offset + 16 > bytes.length) {
      break;
    }

    sizes.push({
      width: bytes[offset] === 0 ? 256 : bytes[offset] ?? 0,
      height: bytes[offset + 1] === 0 ? 256 : bytes[offset + 1] ?? 0,
    });
  }

  return {
    format: "ico",
    width: sizes[0]?.width ?? null,
    height: sizes[0]?.height ?? null,
    sizes,
  };
}

function inspectSvg(
  bytes: Uint8Array,
  contentType: string | null,
): ImageMetadata | null {
  const text = decoder.decode(bytes.slice(0, Math.min(bytes.length, 4096)));
  if (!contentType?.includes("svg") && !/<svg[\s>]/i.test(text)) {
    return null;
  }

  const width = parseNumberAttribute(text.match(/\bwidth=["']?([\d.]+)/i)?.[1]);
  const height = parseNumberAttribute(
    text.match(/\bheight=["']?([\d.]+)/i)?.[1],
  );
  const viewBox = text.match(/\bviewBox=["']?([\d.\s-]+)/i)?.[1]?.trim().split(
    /\s+/,
  ).map(Number);

  return {
    format: "svg",
    width: width ?? (viewBox?.length === 4 ? viewBox[2] ?? null : null),
    height: height ?? (viewBox?.length === 4 ? viewBox[3] ?? null : null),
  };
}

function parseNumberAttribute(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function readUint16Le(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readUint24Le(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) |
    ((bytes[offset + 2] ?? 0) << 16);
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) * 0x1000000) +
    (((bytes[offset + 1] ?? 0) << 16) | ((bytes[offset + 2] ?? 0) << 8) |
      (bytes[offset + 3] ?? 0))
  );
}
