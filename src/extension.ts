import * as vscode from "vscode";
import { lintOysterDocument } from "./oysterLinter";
import { commands } from "./commands";

/**
 * Activates the Oyster extension.
 * @param context The extension context.
 */
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
      md += `\n\nIntroduced in: Oyster **${spec.introducedVersion}**`;
      md += '\n\nFor more information on this command [check the documentation](https://github.com/Danicus2000000/oyster-linter/tree/main/doc/commands/' + cmdKey +'.md).';
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

      if (spec.compatibleGames.length > 0) {
        md += `\n\n**Compatible games:**`;
        for (const game of spec.compatibleGames) {
          md += `\n- ${game}`;
        }
      }

      return new vscode.Hover(new vscode.MarkdownString(md));
    },
  });

  /**
   * Provides command name completions for Oyster 4S commands in Oyster files.
   * Suggests command names from the commands object at the start of a line or after whitespace.
   * Suggestions appear on Ctrl+Space or after typing a letter/underscore at the start of a line or after whitespace.
   */
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "oyster",
      {
        provideCompletionItems(document, position) {
          const line = document.lineAt(position.line).text;
          const prefix = line.slice(0, position.character);
          // Only suggest at start of line or after whitespace
          if (!/^\s*$/.test(prefix) && !/\s$/.test(prefix)) {
            return undefined;
          }
          return Object.keys(commands).map((cmd) => {
            const item = new vscode.CompletionItem(
              cmd,
              vscode.CompletionItemKind.Function
            );
            item.detail = commands[cmd].description;
            item.insertText = cmd;
            item.commitCharacters = ["["];
            return item;
          });
        },
      }
      // No trigger characters: suggestions appear on Ctrl+Space
    )
  );
}

/**
 * Lints an Oyster document and reports diagnostics.
 * @param doc The Oyster document to lint.
 * @param collection The diagnostic collection to report to.
 */
function lintAndReport(
  doc: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
) {
  const diagnostics = lintOysterDocument(doc);
  collection.set(doc.uri, diagnostics);
}

/**
 * Deactivates the Oyster extension.
 */
export function deactivate() {}
