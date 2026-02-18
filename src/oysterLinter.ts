import * as vscode from "vscode";
import { CommandParam, CommandSpec } from "./types";
import { commands, GameAliases } from "./commands";

/**
 * Parses a command parameter value string and checks if it matches the expected type.
 * @param str The parameter value string to parse.
 * @param type The expected type of the parameter.
 * @returns True if the value matches the expected type, false otherwise.
 */
function parseValue(str: string, type: CommandParam["type"]): boolean {
  const s = str.trim();
  // interpolated string: $"..."
  if (type === "string")
    return (
      /^\$?"(?:[^"\\]|\\.)*"$/m.test(s) || /^\$"(?:[^"\\]|\\.)*"$/m.test(s)
    );
  if (type === "int")
    return /^-?\d+$/.test(s) || /^\$[A-Za-z][A-Za-z0-9_]*$/.test(s);
  if (type === "bool")
    return /^(true|false)$/i.test(s) || /^\$[A-Za-z][A-Za-z0-9_]*$/.test(s);
  return false;
}

function getCanonicalGame(name: string | undefined): string | undefined {
  if (!name) return undefined;
  for (const [canon, aliases] of GameAliases) {
    if (canon === name) return canon;
    if (aliases && aliases.includes(name)) return canon;
  }
  return name;
}

function versionToNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const cleaned = v.replace(/\./g, "");
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * Lints an Oyster document for syntax and parameter errors.
 * @param doc The Oyster document to lint.
 * @return An array of diagnostics for any syntax or parameter errors found.
 */
export function lintOysterDocument(
  doc: vscode.TextDocument,
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  type VarInfo = {
    type: CommandParam["type"];
    firstLine: number;
    lastLine: number;
  };
  const variables = new Map<string, VarInfo>();
  // Record conflicts found during declaration scan; we'll emit diagnostics after the scan
  const conflicts: {
    name: string;
    line: number;
    newType: CommandParam["type"];
  }[] = [];
  // First pass: collect variable declarations (Set_IntVar, Set_BoolVar, Set_StringVar)
  // Also collect any `meta` entries (game/version)
  let metaGame: string | undefined;
  let metaVersion: string | undefined;
  for (let i = 0; i < doc.lineCount; i++) {
    const line = doc.lineAt(i);
    const text = line.text.trim();
    if (!text || text.startsWith("#")) continue;
    const match = text.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
    if (!match) continue;
    const cmd = match[1];
    const paramStr = match[2];
    const cmdKey = cmd.toLowerCase();
    if (
      cmdKey === "set_intvar" ||
      cmdKey === "set_boolvar" ||
      cmdKey === "set_stringvar"
    ) {
      // parse params (similar to main parser)
      const params: string[] = [];
      let current = "";
      let inString = false;
      let escape = false;
      for (let idx = 0; idx < paramStr.length; idx++) {
        const char = paramStr[idx];
        if (escape) {
          current += char;
          escape = false;
          continue;
        }
        if (char === "\\") {
          current += char;
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          current += char;
          continue;
        }
        if (char === "," && !inString) {
          params.push(current.trim());
          current = "";
          continue;
        }
        current += char;
      }
      if (current.trim().length > 0) params.push(current.trim());
      if (params.length >= 1) {
        const nameParam = params[0];
        const nameMatch = nameParam.match(/^"([A-Za-z][A-Za-z0-9_]*)"$/);
        if (nameMatch) {
          const varName = nameMatch[1];
          const varType: CommandParam["type"] =
            cmdKey === "set_intvar"
              ? "int"
              : cmdKey === "set_boolvar"
                ? "bool"
                : "string";
          const existing = variables.get(varName);
          if (!existing) {
            variables.set(varName, {
              type: varType,
              firstLine: i,
              lastLine: i,
            });
          } else {
            if (existing.type !== varType) {
              // conflicting redeclaration: record conflict to report after full scan
              conflicts.push({ name: varName, line: i, newType: varType });
              // update lastLine to this redeclaration for hover/lookup purposes
              existing.lastLine = i;
              variables.set(varName, existing);
            } else {
              // same type redeclared: update lastLine
              existing.lastLine = i;
              variables.set(varName, existing);
            }
          }
        }
      }
    }
    // collect meta entries
    if (cmdKey === "meta") {
      // split params by commas outside quotes
      const params: string[] = [];
      let current = "";
      let inString = false;
      let escape = false;
      for (let idx = 0; idx < paramStr.length; idx++) {
        const char = paramStr[idx];
        if (escape) {
          current += char;
          escape = false;
          continue;
        }
        if (char === "\\") {
          current += char;
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          current += char;
          continue;
        }
        if (char === "," && !inString) {
          params.push(current.trim());
          current = "";
          continue;
        }
        current += char;
      }
      if (current.trim().length > 0) params.push(current.trim());
      for (const p of params) {
        const eq = p.indexOf("=");
        if (eq === -1) continue;
        const key = p.substring(0, eq).trim().toLowerCase();
        let val = p.substring(eq + 1).trim();
        // strip surrounding quotes if present
        const qm = val.match(/^"(.*)"$/);
        if (qm) val = qm[1];
        if (key === "game") metaGame = val;
        if (key === "version") metaVersion = val;
      }
    }
  }

  // After collecting declarations, emit diagnostics for any type-conflicts using the final lastLine
  for (const c of conflicts) {
    const info = variables.get(c.name);
    const declLine = info ? info.lastLine : c.line;
    const rng = doc.lineAt(c.line).range;
    diagnostics.push(
      new vscode.Diagnostic(
        rng,
        `Variable $${c.name} previously declared as ${info ? info.type : c.newType} (line ${declLine + 1}); cannot redeclare as ${c.newType}`,
        vscode.DiagnosticSeverity.Error,
      ),
    );
  }

  for (let i = 0; i < doc.lineCount; i++) {
    const line = doc.lineAt(i);
    const text = line.text.trim();
    if (!text || text.startsWith("#")) continue;
    const match = text.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
    if (!match) {
      diagnostics.push(
        new vscode.Diagnostic(
          line.range,
          "Invalid Oyster command syntax. Expected: COMMAND [params]",
          vscode.DiagnosticSeverity.Error,
        ),
      );
      continue;
    }
    const cmd: string = match[1];
    const paramStr: string = match[2];
    // Make command lookup case-insensitive
    const spec: CommandSpec | undefined =
      commands[
        Object.keys(commands).find(
          (k) => k.toLowerCase() === cmd.toLowerCase(),
        ) ?? ""
      ];
    if (!spec) {
      diagnostics.push(
        new vscode.Diagnostic(
          line.range,
          `Unknown Oyster command: ${cmd}`,
          vscode.DiagnosticSeverity.Error,
        ),
      );
      continue;
    }
    // If meta info present, check version and target game compatibility
    // metaGame/metaVersion are the last-seen values from the first pass
    if (metaVersion && spec.introducedVersion) {
      const specVer = versionToNumber(spec.introducedVersion);
      const fileVer = versionToNumber(metaVersion);
      if (specVer !== undefined && fileVer !== undefined && specVer > fileVer) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Command ${cmd} was introduced in Oyster ${spec.introducedVersion} which is newer than script version ${metaVersion}`,
            vscode.DiagnosticSeverity.Warning,
          ),
        );
      }
    }

    if (
      metaGame &&
      spec.compatibleGames &&
      spec.compatibleGames.length > 0 &&
      !spec.compatibleGames.includes("Base")
    ) {
      const canonicalTarget = getCanonicalGame(metaGame);
      if (
        canonicalTarget &&
        !spec.compatibleGames.find((g) => g === canonicalTarget)
      ) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Command ${cmd} may not be compatible with target game ${metaGame} (compatible: ${spec.compatibleGames.join(", ")})`,
            vscode.DiagnosticSeverity.Warning,
          ),
        );
      }
    }
    // Split params: required first, then optional as key=value
    // Only split on commas outside of quotes
    const params: string[] = [];
    let current = "";
    let inString = false;
    let escape = false;
    for (let idx = 0; idx < paramStr.length; idx++) {
      const char = paramStr[idx];
      if (escape) {
        current += char;
        escape = false;
        continue;
      }
      if (char === "\\") {
        current += char;
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        current += char;
        continue;
      }
      if (char === "," && !inString) {
        params.push(current.trim());
        current = "";
        continue;
      }
      current += char;
    }
    if (current.trim().length > 0) params.push(current.trim());
    // Check required
    for (let j = 0; j < spec.required.length; j++) {
      if (!params[j]) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Missing required parameter ${spec.required[j].name} for ${cmd}`,
            vscode.DiagnosticSeverity.Error,
          ),
        );
        continue;
      }
      const p = params[j];
      // variable passed as a parameter
      const varMatch = p.match(/^\$([A-Za-z][A-Za-z0-9_]*)$/);
      if (varMatch) {
        const vn = varMatch[1];
        if (!variables.has(vn)) {
          diagnostics.push(
            new vscode.Diagnostic(
              line.range,
              `Unknown variable \$${vn} used for parameter ${spec.required[j].name}`,
              vscode.DiagnosticSeverity.Error,
            ),
          );
        } else {
          const info = variables.get(vn)!;
          if (info.type !== spec.required[j].type) {
            diagnostics.push(
              new vscode.Diagnostic(
                line.range,
                `Variable \$${vn} is ${info.type} (declared at line ${info.lastLine + 1}) but parameter ${spec.required[j].name} requires ${spec.required[j].type}`,
                vscode.DiagnosticSeverity.Error,
              ),
            );
          }
        }
      } else if (!parseValue(p, spec.required[j].type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Parameter ${spec.required[j].name} should be ${spec.required[j].type}`,
            vscode.DiagnosticSeverity.Error,
          ),
        );
      }
    }
    // Check optional
    for (let j = spec.required.length; j < params.length; j++) {
      const opt: string = params[j];
      const eqIdx: number = opt.indexOf("=");
      if (eqIdx === -1) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Optional parameters must be in the form name=value`,
            vscode.DiagnosticSeverity.Error,
          ),
        );
        continue;
      }
      const key: string = opt.substring(0, eqIdx).trim();
      const val: string = opt.substring(eqIdx + 1).trim();
      const optSpec: CommandParam | undefined = spec.optional.find(
        (o) => o.name === key,
      );
      if (!optSpec) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Unknown optional parameter '${key}' for ${cmd}`,
            vscode.DiagnosticSeverity.Error,
          ),
        );
        continue;
      }
      const varMatch = val.match(/^\$([A-Za-z][A-Za-z0-9_]*)$/);
      if (varMatch) {
        const vn = varMatch[1];
        if (!variables.has(vn)) {
          diagnostics.push(
            new vscode.Diagnostic(
              line.range,
              `Unknown variable \$${vn} used for optional parameter ${key}`,
              vscode.DiagnosticSeverity.Error,
            ),
          );
        } else {
          const info = variables.get(vn)!;
          if (info.type !== optSpec.type) {
            diagnostics.push(
              new vscode.Diagnostic(
                line.range,
                `Variable \$${vn} is ${info.type} (declared at line ${info.lastLine + 1}) but optional parameter ${key} requires ${optSpec.type}`,
                vscode.DiagnosticSeverity.Error,
              ),
            );
          }
        }
      } else if (!parseValue(val, optSpec.type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Optional parameter '${key}' should be ${optSpec.type}`,
            vscode.DiagnosticSeverity.Error,
          ),
        );
      }
    }
  }
  return diagnostics;
}
