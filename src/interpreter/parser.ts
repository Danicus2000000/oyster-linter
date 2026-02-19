export type Param = { name?: string; value: string };
export type Statement = { cmd: string; params: Param[]; raw?: string };

function splitParams(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (esc) {
      cur += ch;
      esc = false;
      continue;
    }
    if (ch === "\\") {
      cur += ch;
      esc = true;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      cur += ch;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim().length > 0) out.push(cur.trim());
  return out;
}

function stripQuotes(s: string) {
  if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
    return s.substring(1, s.length - 1).replace(/\\"/g, '"');
  }
  return s;
}

export function parseLines(text: string): Statement[] {
  const lines = text.split(/\r?\n/);
  const stmts: Statement[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
    if (!m) continue;
    const cmd = m[1];
    const paramStr = m[2];
    const parts = splitParams(paramStr);
    const params: Param[] = parts.map((p) => {
      const eq = p.indexOf("=");
      if (eq !== -1) {
        const name = p.substring(0, eq).trim();
        const val = p.substring(eq + 1).trim();
        return { name, value: stripQuotes(val) };
      }
      return { value: stripQuotes(p) };
    });
    stmts.push({ cmd, params, raw });
  }
  return stmts;
}
