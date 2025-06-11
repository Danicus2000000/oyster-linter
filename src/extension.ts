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
      // Find the command at the start of the line
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[/);
      if (!match) return;
      const cmd = match[1];
      // Make command lookup case-insensitive
      const cmdKey = Object.keys(commands).find(
        (k) => k.toLowerCase() === cmd.toLowerCase()
      );
      if (!cmdKey) return;
      const spec = commands[cmdKey];
      // Only show hover if hovering over the command name
      const cmdStart = line.indexOf(cmd);
      const cmdEnd = cmdStart + cmd.length;
      if (position.character < cmdStart || position.character > cmdEnd) {
        return;
      }
      let md = `**${cmdKey}**`;
      md += `\n\n${spec.description}`;
      if (spec.required.length > 0) {
        md += "\n\n**Required parameters:**";
        for (const p of spec.required) {
          md += `\n- \`${p.name}\` (${p.type}): ${p.description}`;
        }
      }
      if (spec.optional.length > 0) {
        md += "\n\n**Optional parameters:**";
        for (const p of spec.optional) {
          md += `\n- \`${p.name}\` (${p.type}${
            p.default !== undefined ? ", default: " + p.default : ""
          })`;
          md += `: ${p.description}`;
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
