import * as vscode from "vscode";

// Types for Oyster command spec
export interface CommandParam {
  name: string;
  type: "string" | "int" | "bool";
  default?: boolean | number | string;
}

export interface CommandSpec {
  required: CommandParam[];
  optional: CommandParam[];
}

export type CommandMap = Record<string, CommandSpec>;

// Oyster 4S command spec
export const commands: CommandMap = {
  Act_Append: {
    required: [{ name: "text", type: "string" }],
    optional: [
      { name: "instant", type: "bool", default: false },
      { name: "wait", type: "bool", default: true },
    ],
  },
  Act_Speak: {
    required: [{ name: "text", type: "string" }],
    optional: [
      { name: "instant", type: "bool", default: false },
      { name: "wait", type: "bool", default: true },
    ],
  },
  Jump_To: {
    required: [{ name: "marker", type: "string" }],
    optional: [],
  },
  Line_Marker: {
    required: [{ name: "marker", type: "string" }],
    optional: [],
  },
  Set_Looker: {
    required: [{ name: "looker", type: "string" }],
    optional: [],
  },
  Set_Name: {
    required: [{ name: "name", type: "string" }],
    optional: [],
  },
  Set_Script: {
    required: [{ name: "script", type: "string" }],
    optional: [],
  },
  Set_sprite: {
    required: [{ name: "sprite", type: "string" }],
    optional: [],
  },
  Sys_Wait: {
    required: [{ name: "time", type: "int" }],
    optional: [{ name: "canSkip", type: "bool" }],
  },
  Deliver_Gift: {
    required: [
      { name: "to", type: "string" },
      { name: "from", type: "string" },
    ],
    optional: [],
  },
  Give_Item: {
    required: [{ name: "itemName", type: "string" }],
    optional: [],
  },
  Check_Has: {
    required: [
      { name: "personInventory", type: "string" },
      { name: "itemName", type: "string" },
      { name: "giftState", type: "string" },
      { name: "giftState2", type: "string" },
    ],
    optional: [],
  },
};

function parseValue(str: string, type: CommandParam["type"]): boolean {
  if (type === "string") return /^"(?:[^"\\]|\\.)*"$/m.test(str.trim());
  if (type === "int") return /^-?\d+$/.test(str.trim());
  if (type === "bool") return /^(true|false)$/i.test(str.trim());
  return false;
}

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
