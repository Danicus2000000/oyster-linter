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
        provideCompletionItems(document, position, token, context) {
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
      },
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'
    )
  );

  context.subscriptions.push(
    // DocumentSymbolProvider: List all commands and line markers
    vscode.languages.registerDocumentSymbolProvider("oyster", {
      provideDocumentSymbols(document) {
        const symbols = [];
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i).text;
          const cmdMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[/);
          if (cmdMatch) {
            const name = cmdMatch[1];
            const kind = name === "Line_Marker" ? vscode.SymbolKind.Key : vscode.SymbolKind.Function;
            symbols.push(new vscode.DocumentSymbol(name, '', kind, new vscode.Range(i, 0, i, line.length), new vscode.Range(i, 0, i, line.length)));
          }
        }
        return symbols;
      }
    }),
    // DocumentHighlightProvider: Highlight all usages of a marker under cursor
    vscode.languages.registerDocumentHighlightProvider("oyster", {
      provideDocumentHighlights(document, position) {
        const wordRange = document.getWordRangeAtPosition(position, /"[^"]+"/);
        if (!wordRange) return [];
        const marker = document.getText(wordRange).replace(/"/g, "");
        const highlights = [];
        for (let i = 0; i < document.lineCount; i++) {
          const l = document.lineAt(i).text;
          let idx = l.indexOf(`"${marker}"`);
          while (idx !== -1) {
            highlights.push(new vscode.DocumentHighlight(new vscode.Range(i, idx, i, idx + marker.length + 2)));
            idx = l.indexOf(`"${marker}"`, idx + 1);
          }
        }
        return highlights;
      }
    }),
    // SignatureHelpProvider: Show command parameters
    vscode.languages.registerSignatureHelpProvider(
      "oyster",
      {
        provideSignatureHelp(document, position) {
          const line = document.lineAt(position.line).text;
          const cmdMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[/);
          if (!cmdMatch) return null;
          const cmd = cmdMatch[1];
          const spec = commands[Object.keys(commands).find(k => k.toLowerCase() === cmd.toLowerCase()) ?? ""];
          if (!spec) return null;
          const params = [...spec.required, ...spec.optional];
          const sig = new vscode.SignatureInformation(cmd + ' [' + params.map(p => p.name).join(', ') + ']', spec.description);
          sig.parameters = params.map(p => new vscode.ParameterInformation(p.name, p.description));

          // Determine active parameter
          let activeParameter = 0;
          const beforeCursor = line.substring(line.indexOf("[") + 1, position.character);
          // Check for parameter_name =
          let foundNamed = false;
          for (let i = 0; i < params.length; i++) {
            const regex = new RegExp(`\\b${params[i].name}\\s*=`, 'i');
            if (regex.test(beforeCursor)) {
              activeParameter = i;
              foundNamed = true;
              break;
            }
          }
          if (!foundNamed) {
            // Count commas not in quotes
            let inQuotes = false;
            let commaCount = 0;
            for (let i = 0; i < beforeCursor.length; i++) {
              if (beforeCursor[i] === '"') inQuotes = !inQuotes;
              if (!inQuotes && beforeCursor[i] === ',') commaCount++;
            }
            activeParameter = Math.min(commaCount, params.length - 1);
          }

          const help = new vscode.SignatureHelp();
          help.signatures = [sig];
          help.activeSignature = 0;
          help.activeParameter = activeParameter;
          return help;
        }
      },
      '[', ' ', ',',
    ),
    // Formatting providers: Format Oyster commands (align brackets, spacing)
    vscode.languages.registerDocumentFormattingEditProvider("oyster", {
      provideDocumentFormattingEdits(document) {
        const edits = [];
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const trimmed = line.text.trim();
          if (!trimmed) continue;
          const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
          if (match) {
            const cmd = match[1];
            const params = match[2].split(',').map(p => p.trim()).join(', ');
            const formatted = `${cmd} [${params}]`;
            if (line.text !== formatted) {
              edits.push(vscode.TextEdit.replace(line.range, formatted));
            }
          }
        }
        return edits;
      }
    }),
    vscode.languages.registerDocumentRangeFormattingEditProvider("oyster", {
      provideDocumentRangeFormattingEdits(document, range) {
        const edits = [];
        for (let i = range.start.line; i <= range.end.line; i++) {
          const line = document.lineAt(i);
          const trimmed = line.text.trim();
          if (!trimmed) continue;
          const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
          if (match) {
            const cmd = match[1];
            const params = match[2].split(',').map(p => p.trim()).join(', ');
            const formatted = `${cmd} [${params}]`;
            if (line.text !== formatted) {
              edits.push(vscode.TextEdit.replace(line.range, formatted));
            }
          }
        }
        return edits;
      }
    }),
    vscode.languages.registerOnTypeFormattingEditProvider(
      "oyster",
      {
        provideOnTypeFormattingEdits(document, position) {
          const line = document.lineAt(position.line);
          const trimmed = line.text.trim();
          const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
          if (match) {
            const cmd = match[1];
            const params = match[2].split(',').map(p => p.trim()).join(', ');
            const formatted = `${cmd} [${params}]`;
            if (line.text !== formatted) {
              return [vscode.TextEdit.replace(line.range, formatted)];
            }
          }
          return [];
        }
      },
      '\n', ';'
    ),
    // SelectionRangeProvider: Expand selection to command/parameter block
    vscode.languages.registerSelectionRangeProvider("oyster", {
      provideSelectionRanges(document, positions) {
        return positions.map(pos => {
          const line = document.lineAt(pos.line);
          const match = line.text.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
          if (match) {
            const start = line.text.indexOf("[");
            const end = line.text.lastIndexOf("]");
            if (start !== -1 && end !== -1) {
              return new vscode.SelectionRange(new vscode.Range(pos.line, start, pos.line, end + 1));
            }
          }
          return new vscode.SelectionRange(new vscode.Range(pos, pos));
        });
      }
    }),
    // InlineValuesProvider: Show parameter values inline for debugging
    vscode.languages.registerInlineValuesProvider("oyster", {
      provideInlineValues(document, viewport, context) {
        const values = [];
        for (let i = viewport.start.line; i <= viewport.end.line; i++) {
          const line = document.lineAt(i).text;
          const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[(.*)\]$/);
          if (match) {
            const params = match[2].split(',');
            let offset = line.indexOf("[") + 1;
            for (const param of params) {
              const trimmed = param.trim();
              if (trimmed) {
                const idx = line.indexOf(trimmed, offset);
                if (idx !== -1) {
                  values.push(new vscode.InlineValueText(new vscode.Range(i, idx, i, idx + trimmed.length), trimmed));
                  offset = idx + trimmed.length;
                }
              }
            }
          }
        }
        return values;
      }
    }));
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
