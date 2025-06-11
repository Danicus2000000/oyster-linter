import * as vscode from "vscode";
import { lintOysterDocument, commands } from "./oysterLinter";

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("oyster");

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId === "oyster") {
        lintAndReport(doc, diagnosticCollection);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === "oyster") {
        lintAndReport(e.document, diagnosticCollection);
      }
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri);
    })
  );

  // Lint all open Oyster docs on activation
  vscode.workspace.textDocuments.forEach((doc) => {
    if (doc.languageId === "oyster") {
      lintAndReport(doc, diagnosticCollection);
    }
  });

  /**
   * Provides hover documentation for Oyster 4S commands in Oyster files.
   * Shows a summary of each command and its parameters when hovering over the command name.
   */
  vscode.languages.registerHoverProvider("oyster", {
    provideHover(document, position) {
      const line = document.lineAt(position.line).text;
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[/);
      if (!match) return;
      const cmd = match[1];
      const spec = (commands as any)[cmd];
      if (!spec) return;
      let md = "**" + cmd + "**";
      if (spec.required.length > 0) {
        md += "\n\n**Required parameters:**";
        for (const p of spec.required) {
          md += "\n- `" + p.name + "` (" + p.type + ")";
        }
      }
      if (spec.optional.length > 0) {
        md += "\n\n**Optional parameters:**";
        for (const p of spec.optional) {
          md +=
            "\n- `" +
            p.name +
            "` (" +
            p.type +
            (p.default !== undefined ? ", default: " + p.default : "") +
            ")";
        }
      }
      return new vscode.Hover(new vscode.MarkdownString(md));
    },
  });
}

function lintAndReport(
  doc: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
) {
  const diagnostics = lintOysterDocument(doc);
  collection.set(doc.uri, diagnostics);
}

export function deactivate() {}
