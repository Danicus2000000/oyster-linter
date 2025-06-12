import { CommandMap } from "./types";

/**
 * Defines the commands available in the Oyster scripting language.
 */
export const commands: CommandMap = {
  Act_Append: {
    description: "Append text to the current conversation",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [
      {
        name: "text",
        type: "string",
        description: "Text to push to the conversation",
      },
    ],
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
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [
      {
        name: "text",
        type: "string",
        description: "Text to push to the conversation",
      },
    ],
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
    description:
      "Unconditionally jump to a specific line marker in the current script",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [
      { name: "marker", type: "string", description: "Line marker to jump to" },
    ],
    optional: [],
  },
  Line_Marker: {
    description: "Define a line marker in the script",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [{ name: "marker", type: "string", description: "Marker name" }],
    optional: [],
  },
  Set_Looker: {
    description:
      "Updates the object which the player's camera is steered towards, given the object does not exist, does nothing",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [
      {
        name: "looker",
        type: "string",
        description:
          "The name of the object to look at. Supplying 'default' causes the camera to return to the conversation's original looker",
      },
    ],
    optional: [],
  },
  Set_Name: {
    description: "Updates the name of the speaker to the supplied string",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
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
    description:
      "Set the name of the script that the character being interacted with points to. Effect can be seen when next interacting with them",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [{ name: "script", type: "string", description: "Script name" }],
    optional: [],
  },
  Set_sprite: {
    description: "Set the sprite for the character",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [{ name: "sprite", type: "string", description: "Sprite name" }],
    optional: [],
  },
  Sys_Wait: {
    description: "Wait for a specified time",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
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
    introducedVersion: "4.0.0s",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [
      { name: "to", type: "string", description: "Person to deliver to" },
      {
        name: "giftName",
        type: "string",
        description:
          "The name of the gift to deliver. E.G. The first gift from Alyx could be written as 'Alyx_0'",
      },
    ],
    optional: [],
  },
  Give_Item: {
    description:
      "Attempt to give the player an item, given the player cannot accept the item (e.g. full inventory), the game running Oyster should ensure that the item can be retrieved later in some way (e.g. GroveGame drops the item at the player's origin)",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
    required: [
      { name: "itemName", type: "string", description: "Name of the item" },
    ],
    optional: [],
  },
  Check_Has: {
    description:
      "Checks Whether a given character has received a specific item, and jumps to line markers accordingly",
    introducedVersion: "4.0.0s",
    compatibleGames: ["Base"],
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
