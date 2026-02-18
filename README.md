# Oyster Linter (Visual Studio Code Extension)

The Oyster Linter is a Visual Studio Code extension designed to aid in the creation of Oyster scripts for compatible games.

## Features

- **Linting and Validation**: Automatically checks Oyster 4s commands for syntax errors, and can provide suggestions to fix errors.
- **Command Suggestions**: Press `ctrl+space` on a blank line to get a full list of supported commands.
- **Parameter Context**: Hover over a command to bee given an explanation of what the command does, plus what its parameters are and what they do.
- **Language Mode**: Ensure the language mode is set to `Oyster 4s`. If it is not, click the language indicator in the bottom-right corner of VS Code (e.g., "Plain Text") and search for `Oyster 4s` in the available languages.

## Getting Started

1. **Install the Extension**: Download and install the Oyster Linter extension from the VS Code Marketplace.
2. **Set Language Mode**: Open an Oyster 4s file (.osf) the language should automatically be detected, if not set the language mode to `Oyster 4s`.
3. **Start Coding**: Begin writing Oyster 4s commands. The linter will automatically validate your code and provide suggestions.

## Oyster Command Spec

For information on how Oyster commands should be structured and what commands exist, [read the documentation here](https://oyster.abulman.com/).

## Example Workflow

1. Open a new .osf file the language should automatically be detected, if not set the language mode to `Oyster 4s`,
2. Type a command, such as `act_speak []`,
3. Hover over the command to view its description and parameters,
4. Fill in the parameters as required,
5. Repeat until you've written the desired script.
