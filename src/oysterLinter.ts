import * as vscode from "vscode";
import { CommandParam, CommandSpec } from "./types";
import { commands } from "./commands";

/**
 * Parses a command parameter value string and checks if it matches the expected type.
 * @param str The parameter value string to parse.
 * @param type The expected type of the parameter.
 * @returns True if the value matches the expected type, false otherwise.
 */
function parseValue(str: string, type: CommandParam["type"]): boolean {
  if (type === "string") return /^"(?:[^"\\]|\\.)*"$/m.test(str.trim());
  if (type === "int") return /^-?\d+$/.test(str.trim());
  if (type === "bool") return /^(true|false)$/i.test(str.trim());
  return false;
}

/**
  * Lints an Oyster document for syntax and parameter errors.
 * @param doc The Oyster document to lint.
 * @return An array of diagnostics for any syntax or parameter errors found.
 */
export function lintOysterDocument(
  doc: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  for (let i = 0; i < doc.lineCount; i++) {
    const line = doc.lineAt(i);
    const text = line.text.trim();
    if (!text || text.startsWith("#")) continue;
    const match = text.match(/^(\w+)\s*\[(.*)\]$/);
    if (!match) {
      diagnostics.push(
        new vscode.Diagnostic(
          line.range,
          "Invalid Oyster command syntax. Expected: COMMAND [params]",
          vscode.DiagnosticSeverity.Error
        )
      );
      continue;
    }
    const cmd: string = match[1];
    const paramStr: string = match[2];
    // Make command lookup case-insensitive
    const spec: CommandSpec | undefined =
      commands[
        Object.keys(commands).find(
          (k) => k.toLowerCase() === cmd.toLowerCase()
        ) ?? ""
      ];
    if (!spec) {
      diagnostics.push(
        new vscode.Diagnostic(
          line.range,
          `Unknown Oyster command: ${cmd}`,
          vscode.DiagnosticSeverity.Error
        )
      );
      continue;
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
            vscode.DiagnosticSeverity.Error
          )
        );
        continue;
      }
      if (!parseValue(params[j], spec.required[j].type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Parameter ${spec.required[j].name} should be ${spec.required[j].type}`,
            vscode.DiagnosticSeverity.Error
          )
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
            vscode.DiagnosticSeverity.Error
          )
        );
        continue;
      }
      const key: string = opt.substring(0, eqIdx).trim();
      const val: string = opt.substring(eqIdx + 1).trim();
      const optSpec: CommandParam | undefined = spec.optional.find(
        (o) => o.name === key
      );
      if (!optSpec) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Unknown optional parameter '${key}' for ${cmd}`,
            vscode.DiagnosticSeverity.Error
          )
        );
        continue;
      }
      if (!parseValue(val, optSpec.type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            line.range,
            `Optional parameter '${key}' should be ${optSpec.type}`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }
    }
  }
  return diagnostics;
}
