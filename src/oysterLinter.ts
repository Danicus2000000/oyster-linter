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
    required: [{ name: "Parameter1", type: "string" }],
    optional: [
      { name: "instant", type: "bool", default: false },
      { name: "wait", type: "bool", default: true },
    ],
  },
  Act_Speak: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [
      { name: "instant", type: "bool", default: false },
      { name: "wait", type: "bool", default: true },
    ],
  },
  Jump_To: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [],
  },
  Line_Marker: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [],
  },
  Set_Looker: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [],
  },
  Set_Name: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [],
  },
  Set_Script: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [],
  },
  Set_sprite: {
    required: [{ name: "Parameter1", type: "string" }],
    optional: [],
  },
  Sys_Wait: {
    required: [{ name: "Parameter1", type: "int" }],
    optional: [{ name: "canSkip", type: "bool" }],
  },
};

function parseValue(str: string, type: CommandParam["type"]): boolean {
  if (type === "string") return /^".*"$/.test(str.trim());
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
    const spec: CommandSpec | undefined = commands[cmd];
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
    const params: string[] = paramStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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
      const optSpec: CommandParam | undefined = spec.optional.find((o) => o.name === key);
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
