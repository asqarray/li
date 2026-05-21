export function applyAtmosphericShield(rawFeed: string): string {
  if (!rawFeed) return "";

  const lines = rawFeed.split("\n");
  const capturedLines: string[] = [];
  
  // Hard limits for the reasoning layer (1M tokens approx 4MB)
  const MAX_REASONING_CHARS = 3800000; 

  // Symbolic Accumulator for high-frequency hits
  const accumulator: Record<string, { count: number; samples: string[]; firstSeen: string }> = {};
  const ACCUMULATION_THRESHOLD = 20; // Lowered to capture more distinct symbolic groups

  let lastPayload: string | null = null;
  let lastTimestamp: number | null = null;
  const JITTER_THRESHOLD_MS = 2; // Strict jitter detection
  const NOMINAL_POLL_INTERVAL_MS = 400;

  for (const line of lines) {
    const match = line.match(/\[(.*?)\] (.*)/);
    if (!match) {
      // Limit non-standard lines to prevent buffer bloat
      if (line.trim() && capturedLines.length < 500) {
        capturedLines.push(line);
      }
      continue;
    }

    const timestampStr = match[1];
    const payload = match[2].trim();
    const currentTime = new Date(timestampStr).getTime();

    const isNewState = payload !== lastPayload;
    let isJitterEvent = false;
    if (lastTimestamp && !isNaN(currentTime)) {
      const delta = currentTime - lastTimestamp;
      if (Math.abs(delta - NOMINAL_POLL_INTERVAL_MS) > JITTER_THRESHOLD_MS) {
        isJitterEvent = true;
      }
    }

    if (isNewState || isJitterEvent) {
      // Logic signature: first 8 chars of payload usually represent the instruction/address
      const signature = payload.substring(0, 8) + (isJitterEvent ? "_JITTER" : "_STATE");
      
      if (!accumulator[signature]) {
        accumulator[signature] = { count: 0, samples: [], firstSeen: timestampStr };
      }
      
      accumulator[signature].count++;
      if (accumulator[signature].samples.length < 1) {
        accumulator[signature].samples.push(line);
      }
      
      lastPayload = payload;
      lastTimestamp = currentTime;
    }
  }

  // Flush accumulator into captured lines
  const flushedLines: string[] = [];
  for (const [sig, data] of Object.entries(accumulator)) {
    if (data.count > ACCUMULATION_THRESHOLD) {
      flushedLines.push(`[SYMBOLIC_SNAPSHOT] EVENT:${sig} | MAGNITUDE:${data.count} | INITIAL_DETECTION:${data.firstSeen} | SAMPLE:${data.samples[0]}`);
    } else {
      flushedLines.push(...data.samples);
    }
  }

  // Final assembly with hard cap
  const finalOutput = [...capturedLines, ...flushedLines].join("\n");

  if (finalOutput.length > MAX_REASONING_CHARS) {
    return [
      "// ATMO_SHIELD_OUTPUT: CRITICAL_TRUNCATION_ACTIVE",
      "// WARNING: Input flux exceeds context capacity even after symbolic accumulation.",
      finalOutput.substring(0, MAX_REASONING_CHARS / 2),
      "\n\n// ... [MID_STREAM_ENTROPY_PURGED_TO_PRESERVE_TOKEN_QUOTA] ...\n\n",
      finalOutput.substring(finalOutput.length - (MAX_REASONING_CHARS / 2))
    ].join("\n");
  }

  return finalOutput;
}
