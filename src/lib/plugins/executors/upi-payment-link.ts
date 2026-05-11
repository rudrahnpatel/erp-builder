/**
 * UPI Payment Link Generator
 *
 * Generates a UPI deeplink and a data URL for a QR code (canvas-based, no external deps).
 * The QR encoding is a minimal implementation sufficient for UPI URIs.
 */

export interface UPIPaymentInput {
  upiId: string;      // e.g. "merchant@upi"
  merchantName: string;
  amount?: number;
  note?: string;
  refId?: string;
}

export interface UPIPaymentResult {
  deeplink: string;
  qrDataUrl: string;  // base64 PNG data URL
}

/**
 * Build a standard UPI deeplink URI.
 */
export function buildUPIDeeplink(input: UPIPaymentInput): string {
  const params = new URLSearchParams();
  params.set("pa", input.upiId);
  params.set("pn", input.merchantName);
  if (input.amount && input.amount > 0) {
    params.set("am", input.amount.toFixed(2));
  }
  params.set("cu", "INR");
  if (input.note) params.set("tn", input.note);
  if (input.refId) params.set("tr", input.refId);

  return `upi://pay?${params.toString()}`;
}

// ── Minimal QR Code Generator (no dependencies) ──────────────────────

/**
 * Encode text into a QR code and return a PNG data URL.
 * This uses a compact Reed-Solomon + mode/mask implementation.
 * For our use case (short UPI URIs ≤ 200 chars) this is sufficient.
 *
 * We delegate to a canvas-based approach in the browser.
 */
export function generateQRDataUrl(text: string, size: number = 256): string {
  // This function is meant to be called client-side only.
  // It creates an in-memory canvas, draws QR modules, and returns a data URL.
  if (typeof document === "undefined") {
    throw new Error("generateQRDataUrl must be called in the browser");
  }

  const modules = encodeQR(text);
  const moduleCount = modules.length;
  const cellSize = Math.floor(size / (moduleCount + 8)); // 4-module quiet zone each side
  const actualSize = cellSize * (moduleCount + 8);

  const canvas = document.createElement("canvas");
  canvas.width = actualSize;
  canvas.height = actualSize;
  const ctx = canvas.getContext("2d")!;

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, actualSize, actualSize);

  // Draw modules
  ctx.fillStyle = "#000000";
  const offset = cellSize * 4; // quiet zone
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        ctx.fillRect(
          offset + col * cellSize,
          offset + row * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  return canvas.toDataURL("image/png");
}

// ── QR Encoding (Byte mode, ECC Level M, Version auto) ───────────────
// Minimal implementation covering versions 1-10 which handle up to ~271 bytes
// at ECC level M — more than enough for UPI URIs.

// Version capacity (data codewords at ECC M)
const VERSION_CAPACITY_M = [
  0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216,
];
// Total codewords per version
const TOTAL_CODEWORDS = [
  0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
];
// ECC codewords per block for ECC M
const ECC_PER_BLOCK_M = [
  0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26,
];
// Number of error correction blocks for ECC M
const NUM_BLOCKS_M = [
  0, 1, 1, 1, 2, 2, 4, 4, 4, 4, 4,
];

function encodeQR(text: string): boolean[][] {
  const data = new TextEncoder().encode(text);
  const len = data.length;

  // Pick version
  let version = 1;
  for (let v = 1; v <= 10; v++) {
    if (len <= VERSION_CAPACITY_M[v]) {
      version = v;
      break;
    }
  }
  if (len > VERSION_CAPACITY_M[version]) {
    throw new Error("Text too long for QR (max ~216 bytes)");
  }

  const size = version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  // Place function patterns
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, 0, size - 7);
  placeFinder(matrix, size - 7, 0);
  placeTimingPatterns(matrix, size);
  placeDarkModule(matrix, version);
  reserveFormatArea(matrix, size);
  if (version >= 2) placeAlignmentPattern(matrix, version, size);

  // Encode data
  const dataStream = encodeDataStream(data, version);

  // Add error correction
  const ecStream = addErrorCorrection(dataStream, version);

  // Place data bits
  placeDataBits(matrix, ecStream, size);

  // Apply best mask
  const best = applyBestMask(matrix, size, version);

  return best.map((row) => row.map((v) => v === true));
}

function placeFinder(matrix: (boolean | null)[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr < 0 || mc < 0 || mr >= matrix.length || mc >= matrix.length)
        continue;
      if (
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      ) {
        matrix[mr][mc] = true;
      } else {
        matrix[mr][mc] = false;
      }
    }
  }
}

function placeTimingPatterns(matrix: (boolean | null)[][], size: number) {
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }
}

function placeDarkModule(matrix: (boolean | null)[][], version: number) {
  matrix[4 * version + 9][8] = true;
}

function reserveFormatArea(matrix: (boolean | null)[][], size: number) {
  for (let i = 0; i < 8; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
  }
  if (matrix[8][8] === null) matrix[8][8] = false;
}

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

function placeAlignmentPattern(
  matrix: (boolean | null)[][],
  version: number,
  size: number
) {
  const positions = ALIGNMENT_POSITIONS[version];
  if (!positions) return;
  for (const row of positions) {
    for (const col of positions) {
      // Skip if overlapping with finder patterns
      if (row <= 8 && col <= 8) continue;
      if (row <= 8 && col >= size - 8) continue;
      if (row >= size - 8 && col <= 8) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const val =
            Math.abs(r) === 2 ||
            Math.abs(c) === 2 ||
            (r === 0 && c === 0);
          matrix[row + r][col + c] = val;
        }
      }
    }
  }
}

function encodeDataStream(data: Uint8Array, version: number): number[] {
  const totalDataCodewords = VERSION_CAPACITY_M[version];
  const bits: number[] = [];

  // Mode indicator: Byte = 0100
  bits.push(0, 1, 0, 0);

  // Character count (8 bits for versions 1-9, 16 for 10+)
  const ccBits = version <= 9 ? 8 : 16;
  for (let i = ccBits - 1; i >= 0; i--) {
    bits.push((data.length >> i) & 1);
  }

  // Data
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Terminator (up to 4 zeros)
  const maxBits = totalDataCodewords * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }

  // Pad to byte boundary
  while (bits.length % 8 !== 0 && bits.length < maxBits) {
    bits.push(0);
  }

  // Pad codewords (alternating 0xEC, 0x11)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    for (let i = 7; i >= 0; i--) {
      bits.push((padBytes[padIdx] >> i) & 1);
    }
    padIdx = (padIdx + 1) % 2;
  }

  return bits;
}

function addErrorCorrection(dataBits: number[], version: number): number[] {
  const totalCodewords = TOTAL_CODEWORDS[version];
  const eccPerBlock = ECC_PER_BLOCK_M[version];
  const numBlocks = NUM_BLOCKS_M[version];
  const totalData = VERSION_CAPACITY_M[version];
  const totalEcc = totalCodewords - totalData;

  // Convert bits to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < dataBits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8 && i + j < dataBits.length; j++) {
      byte = (byte << 1) | dataBits[i + j];
    }
    dataBytes.push(byte);
  }

  // Split into blocks
  const basePerBlock = Math.floor(totalData / numBlocks);
  const extra = totalData % numBlocks;

  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let offset = 0;

  for (let b = 0; b < numBlocks; b++) {
    const blockLen = basePerBlock + (b >= numBlocks - extra ? 1 : 0);
    const block = dataBytes.slice(offset, offset + blockLen);
    offset += blockLen;
    dataBlocks.push(block);
    eccBlocks.push(rsEncode(block, eccPerBlock));
  }

  // Interleave data blocks
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  const result: number[] = [];
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave ECC blocks
  for (let i = 0; i < eccPerBlock; i++) {
    for (const block of eccBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Convert back to bits
  const bits: number[] = [];
  for (const byte of result) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Remainder bits (versions 2-6: 7 bits)
  if (version >= 2 && version <= 6) {
    for (let i = 0; i < 7; i++) bits.push(0);
  }

  return bits;
}

// GF(256) with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: number[], eccLen: number): number[] {
  // Build generator polynomial
  let gen = [1];
  for (let i = 0; i < eccLen; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], GF_EXP[i]);
    }
    gen = newGen;
  }

  const padded = [...data, ...new Array(eccLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = padded[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        padded[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }

  return padded.slice(data.length);
}

function placeDataBits(
  matrix: (boolean | null)[][],
  bits: number[],
  size: number
) {
  let bitIdx = 0;
  let upward = true;

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // Skip timing column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (let c = 0; c <= 1; c++) {
        const actualCol = col - c;
        if (actualCol < 0) continue;
        if (matrix[row][actualCol] !== null) continue;
        matrix[row][actualCol] = bitIdx < bits.length ? bits[bitIdx++] === 1 : false;
      }
    }

    upward = !upward;
  }
}

// Format information for ECC level M (0b00) with each mask pattern
const FORMAT_INFO_M = [
  0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
];

function applyMask(
  matrix: (boolean | null)[][],
  size: number,
  maskNum: number
): boolean[][] {
  const result = matrix.map((row) => [...row]);
  const maskFn = getMaskFn(maskNum);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Only mask data/ecc modules (those that were null in the template)
      // We check by whether the original matrix had a function pattern
      // For simplicity, we re-check known function pattern areas
      if (isFunctionPattern(r, c, size, Math.floor((size - 17) / 4))) continue;
      if (maskFn(r, c)) {
        result[r][c] = !result[r][c];
      }
    }
  }

  // Write format info
  const formatBits = FORMAT_INFO_M[maskNum];
  const finalResult = result.map((row) => row.map((v) => v === true));
  writeFormatInfo(finalResult, formatBits, size);

  return finalResult;
}

function isFunctionPattern(
  r: number,
  c: number,
  size: number,
  version: number
): boolean {
  // Finder patterns + separators
  if (r <= 8 && c <= 8) return true;
  if (r <= 8 && c >= size - 8) return true;
  if (r >= size - 8 && c <= 8) return true;
  // Timing
  if (r === 6 || c === 6) return true;
  // Dark module
  if (r === 4 * version + 9 && c === 8) return true;
  // Alignment (simplified check)
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version];
    if (positions) {
      for (const pr of positions) {
        for (const pc of positions) {
          if (pr <= 8 && pc <= 8) continue;
          if (pr <= 8 && pc >= size - 8) continue;
          if (pr >= size - 8 && pc <= 8) continue;
          if (Math.abs(r - pr) <= 2 && Math.abs(c - pc) <= 2) return true;
        }
      }
    }
  }
  return false;
}

function getMaskFn(mask: number): (r: number, c: number) => boolean {
  switch (mask) {
    case 0: return (r, c) => (r + c) % 2 === 0;
    case 1: return (r) => r % 2 === 0;
    case 2: return (_, c) => c % 3 === 0;
    case 3: return (r, c) => (r + c) % 3 === 0;
    case 4: return (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return (r, c) => ((r * c) % 2 + (r * c) % 3) === 0;
    case 6: return (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0;
    case 7: return (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0;
    default: return () => false;
  }
}

function writeFormatInfo(matrix: boolean[][], bits: number, size: number) {
  for (let i = 0; i < 15; i++) {
    const bit = ((bits >> (14 - i)) & 1) === 1;

    // Horizontal near top-left
    if (i < 6) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    // Vertical near bottom-left + horizontal near top-right
    if (i < 8) {
      matrix[size - 1 - i][8] = bit;
    } else {
      matrix[8][size - 15 + i] = bit;
    }
  }
}

function scoreMask(matrix: boolean[][], size: number): number {
  let score = 0;

  // Penalty 1: Adjacent same-color modules in row/column
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
        if (count === 5) score += 3;
        else if (count > 5) score += 1;
      } else {
        count = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
        if (count === 5) score += 3;
        else if (count > 5) score += 1;
      } else {
        count = 1;
      }
    }
  }

  return score;
}

function applyBestMask(
  matrix: (boolean | null)[][],
  size: number,
  version: number
): boolean[][] {
  let bestMask = 0;
  let bestScore = Infinity;
  let bestMatrix: boolean[][] = [];

  for (let m = 0; m < 8; m++) {
    const masked = applyMask(matrix, size, m);
    const s = scoreMask(masked, size);
    if (s < bestScore) {
      bestScore = s;
      bestMask = m;
      bestMatrix = masked;
    }
  }

  return bestMatrix;
}
