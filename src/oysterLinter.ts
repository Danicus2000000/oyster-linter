import * as vscode from "vscode";

// Types for Oyster command spec
export interface CommandParam {
  name: string;
  type: "string" | "int" | "bool";
  default?: boolean | number | string;
  description: string;
}

export interface CommandSpec {
  description: string;
  required: CommandParam[];
  optional: CommandParam[];
}

export type CommandMap = Record<string, CommandSpec>;

// Oyster 4S command spec
export const commands: CommandMap = {
  Act_Append: {
    description: "Append text to the current conversation",
    required: [{ name: "text", type: "string", description: "Text to push to the conversation" }],
    optional: [
      {
        name: "instant",
        type: "bool",
        default: false,
        description: "If true, push all text instantly, rather than over time",
      },
      {
        name: "wait",
        type: "bool",
        default: true,
        description:
          "If true, require user input before progressing to the next line",
      },
    ],
  },
  Act_Speak: {
    description: "Replace the current conversation's text",
    required: [{ name: "text", type: "string", description: "Text to push to the conversation" }],
    optional: [
      {
        name: "instant",
        type: "bool",
        default: false,
        description: "If true, push all text instantly, rather than over time",
      },
      {
        name: "wait",
        type: "bool",
        default: true,
        description:
          "If true, require user input before progressing to the next line",
      },
    ],
  },
  Jump_To: {
    description: "Unconditionally jump to a specific line marker in the current script",
    required: [
      { name: "marker", type: "string", description: "Line marker to jump to" },
    ],
    optional: [],
  },
  Line_Marker: {
    description: "Define a line marker in the script",
    required: [{ name: "marker", type: "string", description: "Marker name" }],
    optional: [],
  },
  Set_Looker: {
    description: "Updates the object which the player's camera is steered towards, given the object does not exist, does nothing",
    required: [
      { name: "looker", type: "string", description: "The name of the object to look at. Supplying 'default' causes the camera to return to the conversation's original looker" },
    ],
    optional: [],
  },
  Set_Name: {
    description: "Updates the name of the speaker to the supplied string",
    required: [
      {
        name: "name",
        type: "string",
        description: "New speaker name",
      },
    ],
    optional: [],
  },
  Set_Script: {
    description: "Set the name of the script that the character being interacted with points to. Effect can be seen when next interacting with them",
    required: [{ name: "script", type: "string", description: "Script name" }],
    optional: [],
  },
  Set_sprite: {
    description: "Set the sprite for the character",
    required: [{ name: "sprite", type: "string", description: "Sprite name" }],
    optional: [],
  },
  Sys_Wait: {
    description: "Wait for a specified time",
    required: [
      {
        name: "time",
        type: "int",
        description: "Time to wait in milliseconds",
      },
    ],
    optional: [
      {
        name: "canSkip",
        type: "bool",
        description: "If true, user can skip the wait",
      },
    ],
  },
  Deliver_Gift: {
    description: "Deliver a named gift to someone",
    required: [
      { name: "to", type: "string", description: "Person to deliver to" },
      {
        name: "giftName",
        type: "string",
        description: "The name of the gift to deliver. E.G. The first gift from Alyx could be written as 'Alyx_0'",
      },
    ],
    optional: [],
  },
  Give_Item: {
    description: "Attempt to give the player an item, given the player cannot accept the item (e.g. full inventory), the game running Oyster should ensure that the item can be retrieved later in some way (e.g. GroveGame drops the item at the player's origin)",
    required: [
      { name: "itemName", type: "string", description: "Name of the item" },
    ],
    optional: [],
  },
  Check_Has: {
    description: "Checks Whether a given character has received a specific item, and jumps to line markers accordingly",
    required: [
      {
        name: "person",
        type: "string",
        description: "The person to check",
      },
      {
        name: "itemName",
        type: "string",
        description: "Name of the item to check",
      },
      {
        name: "successMarker",
        type: "string",
        description: "Name of line marker to jump to on success",
      },
      {
        name: "failureMarker",
        type: "string",
        description: "Name of line marker to jump to on failure",
      },
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
