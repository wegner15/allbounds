import type { FlightSegment } from '../../../../lib/types/finance';

export interface ParsedFlightPlanResult {
  segments: FlightSegment[];
  skippedLines: string[];
}

const VALID_DAYS = new Set([
  'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU',
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
]);

function normalizeTime(raw: string): string {
  // Convert "09:35" -> "0935", preserving optional "+1" / "-1" suffix
  return raw.replace(':', '').trim().toUpperCase();
}

/**
 * Formats a 4-digit military time string like "0935" into "09:35" (preserving "+1" etc.).
 * Leaves already-formatted or non-standard strings intact.
 */
export function formatFlightTime(time?: string): string {
  if (!time) return '';
  const trimmed = time.trim();
  const match = /^(\d{2})(\d{2})([+-]\d)?$/.exec(trimmed);
  if (match) {
    return `${match[1]}:${match[2]}${match[3] || ''}`;
  }
  return trimmed;
}

/**
 * Parses a single GDS / Amadeus / Galileo / Sabre flight segment line.
 *
 * Supported examples:
 * - "1 KQ 411 28NOV EBB NBO 0935 1050 SA"
 * - "2 KQ 756 28NOV NBO LLW 1210 1325 SA"
 * - "KQ 411 28NOV EBBNBO 09:35 10:50"
 * - "1. KQ411 Y 28NOV 6 EBBNBO HK1 0935 1050 SA"
 * - "3) ET 339 03DEC EBB-ADD 12:30 15:55 TH"
 */
export function parseGdsFlightLine(rawLine: string): FlightSegment | null {
  const cleaned = rawLine.trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;

  // 1. Strip optional leading line number (e.g. "1 ", "1. ", "2) ")
  let rest = cleaned.replace(/^\d{1,2}[.)]?\s+/, '');

  // 2. Match airline (2 alphanumeric chars with at least 1 letter) + flight number (1-4 digits)
  //    Optionally followed by a single booking-class letter (attached or space-separated)
  const flightMatch = /^([A-Z0-9]{2})\s*(\d{1,4})(?:[A-Z])?\b/i.exec(rest);
  if (!flightMatch) return null;

  const airline = flightMatch[1].toUpperCase();
  // Ensure airline code has at least one letter (avoid matching bare numbers)
  if (!/[A-Z]/.test(airline)) return null;
  const flightNumber = flightMatch[2];

  rest = rest.slice(flightMatch[0].length).trim();

  // 3. Find date token: DDMMM (e.g. 28NOV, 3DEC), YYYY-MM-DD, or DD/MM(/YYYY)
  const dateMatch = /\b(\d{1,2}[A-Z]{3}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i.exec(rest);
  if (!dateMatch) return null;

  const date = dateMatch[1].toUpperCase();
  rest = rest.slice(dateMatch.index + dateMatch[0].length).trim();

  // 4. Find origin & destination (3-letter IATA codes, space/hyphen/slash/arrow separated or combined 6 letters)
  //    Skip optional single-digit day-of-week number before airports (e.g. Amadeus "28NOV 6 EBBNBO")
  const afterDayNum = rest.replace(/^\d\s+/, '');
  const routeMatch = /\b([A-Z]{3})\s*(?:[-/→>]\s*)?([A-Z]{3})\b/i.exec(afterDayNum);
  if (!routeMatch) return null;

  const origin = routeMatch[1].toUpperCase();
  const destination = routeMatch[2].toUpperCase();
  rest = afterDayNum.slice(routeMatch.index + routeMatch[0].length).trim();

  // 5. Find departure & arrival times (HHMM or HH:MM, with optional +1/-1 day offset)
  const timeRegex = /\b(\d{2}:?\d{2}(?:[+-]\d)?)\b/g;
  const times: { value: string; endIndex: number }[] = [];
  let tMatch: RegExpExecArray | null;
  while ((tMatch = timeRegex.exec(rest)) !== null) {
    times.push({ value: tMatch[1], endIndex: tMatch.index + tMatch[0].length });
    if (times.length === 2) break;
  }

  if (times.length < 2) return null;

  const departureTime = normalizeTime(times[0].value);
  const arrivalTime = normalizeTime(times[1].value);

  // 6. Optional day-of-week after arrival time (e.g. "SA", "TH", "MON")
  const trailing = rest.slice(times[1].endIndex).trim();
  let day: string | undefined;
  if (trailing) {
    const tokens = trailing.split(/\s+/);
    for (const tok of tokens) {
      const upper = tok.replace(/[^A-Z]/gi, '').toUpperCase();
      if (VALID_DAYS.has(upper)) {
        day = upper.slice(0, 2);
        break;
      }
    }
  }

  const segment: FlightSegment = {
    airline,
    flight_number: flightNumber,
    date,
    origin,
    destination,
    departure_time: departureTime,
    arrival_time: arrivalTime,
  };
  if (day) {
    segment.day = day;
  }

  return segment;
}

/**
 * Parses a multi-line GDS flight itinerary string into structured FlightSegment rows.
 */
export function parseGdsFlightPlan(rawText: string): ParsedFlightPlanResult {
  const lines = rawText.split(/\r?\n/);
  const segments: FlightSegment[] = [];
  const skippedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = parseGdsFlightLine(trimmed);
    if (parsed) {
      segments.push(parsed);
    } else {
      skippedLines.push(trimmed);
    }
  }

  return { segments, skippedLines };
}
