import * as vscode from "vscode";
import { parseLines, Statement } from "./parser";

type VarValue = string | number | boolean;

export class VM {
  stmts: Statement[];
  labels: Map<string, number> = new Map();
  vars: Map<string, { type: string; value: VarValue }> = new Map();
  out: vscode.OutputChannel;
  ctx: vscode.ExtensionContext | undefined;

  constructor(text: string, out: vscode.OutputChannel) {
    this.stmts = parseLines(text);
    this.out = out;
    this.indexLabels();
  }

  private indexLabels() {
    for (let i = 0; i < this.stmts.length; i++) {
      const s = this.stmts[i];
      if (s.cmd.toLowerCase() === "line_marker" && s.params[0]) {
        const name = s.params[0].value;
        this.labels.set(name, i);
      }
    }
  }

  async run() {
    this.out.clear();
    this.out.show(true);
    for (let pc = 0; pc < this.stmts.length; pc++) {
      const s = this.stmts[pc];
      const cmd = s.cmd.toLowerCase();
      switch (cmd) {
        case "act_speak":
          this.out.appendLine(stripNull(s.params[0]?.value ?? ""));
          break;
        case "act_append":
          this.out.appendLine(stripNull(s.params[0]?.value ?? ""));
          break;
        case "line_marker":
          // already indexed
          break;
        case "jump_to": {
          const target = s.params[0]?.value;
          if (target && this.labels.has(target)) {
            pc = (this.labels.get(target) ?? pc) - 0;
          }
          break;
        }
        case "set_intvar":
        case "set_boolvar":
        case "set_stringvar": {
          const name = s.params[0]?.value;
          const val = s.params[1]?.value;
          if (!name) break;
          if (cmd === "set_intvar") {
            const n = parseInt(val ?? "0", 10);
            this.vars.set(name, { type: "int", value: n });
          } else if (cmd === "set_boolvar") {
            const b = (val ?? "false").toLowerCase() === "true";
            this.vars.set(name, { type: "bool", value: b });
          } else {
            this.vars.set(name, { type: "string", value: val ?? "" });
          }
          break;
        }
        case "sys_wait": {
          const ms = parseInt(s.params[0]?.value ?? "0", 10);
          await sleep(ms);
          break;
        }
        case "show_options": {
          // Show up to 3 options; optional params lm1..lm3 map to markers
          const texts = [s.params[0]?.value, s.params[1]?.value, s.params[2]?.value].filter(Boolean) as string[];
          const lms = [getParamByName(s.params, "lm1"), getParamByName(s.params, "lm2"), getParamByName(s.params, "lm3")];
          const pick = await vscode.window.showQuickPick(texts, { placeHolder: "Choose an option" });
          if (pick) {
            const idx = texts.indexOf(pick);
            const target = lms[idx] ? lms[idx].value : undefined;
            if (target && this.labels.has(target)) {
              pc = (this.labels.get(target) ?? pc) - 0;
            }
          }
          break;
        }
        case "meta":
          // ignore
          break;
        default:
          this.out.appendLine(`(unhandled) ${s.cmd} ${s.params.map(p=>p.value).join(", ")}`);
      }
    }
  }
}

function getParamByName(params: { name?: string; value: string }[], name: string) {
  for (const p of params) if (p.name === name) return p;
  return undefined;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, Math.max(0, ms)));
}

function stripNull(s: string) {
  return s ?? "";
}
