/**
 * Defines a command parameter for a game command.
 */
export interface CommandParam {
  name: string;
  type: "string" | "int" | "bool";
  default?: boolean | number | string;
  description: string;
}
/**
 * Defines the specification for a game command, including its description, version introduced, compatible games, and parameters.
 */
export interface CommandSpec {
  description: string;
  introducedVersion: string;
  docUrl: string;
  compatibleGames: string[];
  required: CommandParam[];
  optional: CommandParam[];
}

/**
 * Defines a map of command names to their specifications.
 */
export type CommandMap = Record<string, CommandSpec>;
