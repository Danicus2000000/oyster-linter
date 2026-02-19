import * as vscode from "vscode";
import { VM } from "./vm";

export async function runDocument(document: vscode.TextDocument) {
  const out = vscode.window.createOutputChannel("Oyster Interpreter");
  const vm = new VM(document.getText(), out);
  try {
    await vm.run();
  } catch (e) {
    out.appendLine("Error during execution: " + String(e));
  }
}
