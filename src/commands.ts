import { CommandMap } from "./types";

/**
 * Defines the commands available in the Oyster scripting language.
 */
export const commands: CommandMap = {
  Act_Append: {
    description: "Appends the given text to the end of the main text box.",
    introducedVersion: "4.0.0",
    docUrl: "base/act_append",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string containing text to display.",
      },
    ],
    optional: [
      {
        name: "instant",
        type: "bool",
        default: false,
        description:
          "A boolean describing whether the script should push all characters instantly or not, defaults to false.",
      },
      {
        name: "wait",
        type: "bool",
        default: true,
        description:
          "A boolean describing whether the script should wait for user input when done or not, defaults to true.",
      },
      {
        name: "mute",
        type: "bool",
        default: false,
        description:
          "A boolean describing whether Oyster should play any speech sounds while text is being pushed, defaults to false.",
      },
    ],
  },
  Act_Speak: {
    description:
      "Replaces the contents of the main text box with the given text.",
    introducedVersion: "4.0.0",
    docUrl: "base/act_speak",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string containing text to display.",
      },
    ],
    optional: [
      {
        name: "instant",
        type: "bool",
        default: false,
        description:
          "A boolean describing whether the script should push all characters instantly or not, defaults to false.",
      },
      {
        name: "wait",
        type: "bool",
        default: true,
        description:
          "A boolean describing whether the script should wait for user input when done or not, defaults to true.",
      },
      {
        name: "mute",
        type: "bool",
        default: false,
        description:
          "A boolean describing whether Oyster should play any speech sounds while text is being pushed, defaults to false.",
      },
    ],
  },
  Call_Puppet: {
    description:
      "A command for when you are too lazy to write a new command. Allows for a string to be passed, where when the command is run, an event within Oyster is called with that string passed to it. From that there should be a script within the game that is listening for that event, which will then use that string to decide what to do.",
    introducedVersion: "4.1.0",
    docUrl: "base/call_puppet",
    compatibleGames: ["Base", "Speed Dating for the Socially Inept (4.0.0)"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string representing the command name.",
      },
    ],
    optional: [],
  },
  Jump_To: {
    description:
      "Moves the current line-number to the line-number described by the line of the given name (implemented via Line_Marker), or does nothing if the given Line_Marker does not exist.",
    introducedVersion: "4.0.0",
    docUrl: "base/jump_to",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the name of the line marker to jump to.",
      },
    ],
    optional: [],
  },
  Line_Marker: {
    description:
      "Informs the speech system that this line should be tracked as a line marker, by the given name.",
    introducedVersion: "4.0.0",
    docUrl: "base/line_marker",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string describing the name for this line marker.",
      },
    ],
    optional: [],
  },
  Meta: {
    description:
      "This command is never actually seen by the conversation. Its entire purpose is to provide optional info to the implementation of Oyster running the script so that it can handle the script accordingly (Whether that be logging incompatibility as a warning or emulating Oyster features exclusive to that version is up to the implementation).",
    introducedVersion: "4.0.1",
    docUrl: "base/meta",
    compatibleGames: ["Base"],
    required: [],
    optional: [
      {
        name: "version",
        type: "string",
        description:
          "A string representing the game version which this script was designed for. An example would be \“4.0.0\”",
      },
      {
        name: "game",
        type: "string",
        description:
          'A string representing the game that this script is targetting. An example would be "GroveGame"',
      },
    ],
  },
  Set_BoolVar: {
    description:
      "Declares a variable with the given value. If the variable already exists, then it updates the value of the variable to the given value. When updating the value of a variable, the type must be the same as the original value, or else this command will skip updating the value.",
    introducedVersion: "4.1.0",
    docUrl: "base/set_boolvar",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string representing the name of the variable.",
      },
      {
        name: "Parameter2",
        type: "bool",
        description: "A boolean representing the variable value.",
      },
    ],
    optional: [],
  },
  Set_Colour: {
    description:
      "Sets the colour of the character’s name to the parameters specified in one frame.\n\nIf all parameters are passed as -1, then Oyster resets the text colour to its original value from the start of the conversation.",
    introducedVersion: "4.1.0",
    docUrl: "base/set_colour",
    compatibleGames: ["Base", "Speed Dating for the Socially Inept (4.0.0)"],
    required: [
      {
        name: "Parameter1",
        type: "int",
        description:
          "An integer from 0-255 representing the red value of the colour.",
      },
      {
        name: "Parameter2",
        type: "int",
        description:
          "An integer from 0-255 representing the green value of the colour.",
      },
      {
        name: "Parameter3",
        type: "int",
        description:
          "An integer from 0-255 representing the blue value of the colour.",
      },
      {
        name: "Parameter4",
        type: "int",
        description:
          "An integer from 0-255 representing the alpha value of the colour.",
      },
    ],
    optional: [],
  },
  Set_FOV: {
    description:
      "Updates Oyster’s ‘Target FOV’ value, given the new value is different, Oyster will lerp to the new FOV value quickly while running other commands.",
    introducedVersion: "4.1.0",
    docUrl: "base/set_fov",
    compatibleGames: ["Base", "Speed Dating for the Socially Inept (4.0.0)"],
    required: [
      {
        name: "Parameter1",
        type: "int",
        description: "An integer representing the new target FOV value.",
      },
    ],
    optional: [],
  },
  Set_IntVar: {
    description:
      "Declares a variable with the given value. If the variable already exists, then it updates the value of the variable to the given value. When updating the value of a variable, the type must be the same as the original value, or else this command will skip updating the value.",
    introducedVersion: "4.1.0",
    docUrl: "base/set_intvar",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string representing the name of the variable.",
      },
      {
        name: "Parameter2",
        type: "int",
        description: "An integer representing the variable value.",
      },
    ],
    optional: [],
  },
  Set_Looker: {
    description:
      "Attempts to swap the current look target to the object of the given name, if the target object is not present, it does nothing, if the value **default** is passed, it returns to the original look target always.",
    introducedVersion: "4.1.0",
    docUrl: "base/set_looker",
    compatibleGames: ["Base", "Speed Dating for the Socially Inept (4.0.0)"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string describing the name of the desired look target.",
      },
    ],
    optional: [],
  },
  Set_Name: {
    description:
      "Changes the value of the name display in the conversation to the given name. **Does not change the name of the character beyond the scope of the current conversation**. Is intended to be used to spoof multiple characters, alongside Set_Looker.",
    introducedVersion: "4.0.0",
    docUrl: "base/set_name",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the value to set for the name display.",
      },
    ],
    optional: [],
  },
  Set_Script: {
    description:
      "Changes the script that the current character is pointing to to the given value, intended to allow for characters to change conversation between chats or based on given events. **Does not reload the script after being called, player has to manually re-enter conversation, nor does it cause the current conversation to end**.",
    introducedVersion: "4.0.0",
    docUrl: "base/set_script",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the name of the script to change the character to.",
      },
    ],
    optional: [],
  },
  Set_sprite: {
    description:
      "Changes the current sprite to the one described by the above parameter, if the sprite does not exist, should swap to an error sprite.",
    introducedVersion: "4.0.0",
    docUrl: "base/set_sprite",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string representing the name of the sprite to swap to.",
      },
    ],
    optional: [],
  },
  Set_StringVar: {
    description:
      "Declares a variable with the given value. If the variable already exists, then it updates the value of the variable to the given value. When updating the value of a variable, the type must be the same as the original value, or else this command will skip updating the value.",
    introducedVersion: "4.1.0",
    docUrl: "base/set_stringvar",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string representing the name of the variable.",
      },
      {
        name: "Parameter2",
        type: "string",
        description: "A string representing the variable value.",
      },
    ],
    optional: [],
  },
  Sys_Wait: {
    description:
      "Waits for the given amount of time, or skips on player input, if that parameter is set.",
    introducedVersion: "4.0.0",
    docUrl: "base/sys_wait",
    compatibleGames: ["Base"],
    required: [
      {
        name: "Parameter1",
        type: "int",
        description:
          "An integer representing the amount of time to wait for, in milliseconds",
      },
    ],
    optional: [
      {
        name: "canSkip",
        type: "bool",
        description:
          "A boolean value describing whether the player can click to skip this wait or not.",
      },
    ],
  },
  Check_Has: {
    description:
      "Checks whether the given character 'has' the given item, as in whether the player has delivered this item to them. Jumps to the respective line markers for whether the check passes or fails.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/check_has",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the name of the character to check.",
      },
      {
        name: "Parameter2",
        type: "string",
        description: "A string representing the name of the item to check for.",
      },
      {
        name: "Parameter3",
        type: "string",
        description:
          "A string representing a line marker to jump to if the character has the item.",
      },
      {
        name: "Parameter4",
        type: "string",
        description:
          "A string representing a line marker to jump to if the character does not have the item.",
      },
    ],
    optional: [],
  },
  Check_Win: {
    description:
      "A very hardcoded command that simply checks if a certain number of presents have been delivered. Given that a certain number of presents have been delivered, the script is jumped to the line marker named by 'Parameter1'. Otherwise, jumps to the line marker described by 'Parameter2'.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/check_win",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the name of the line marker to jump to if the check passes.",
      },
      {
        name: "Parameter2",
        type: "string",
        description:
          "A string representing the name of the line marker to jump to if the check fails.",
      },
    ],
    optional: [],
  },
  Deliver_Gift: {
    description:
      "Marks the named gift as being delivered to the named person. This marking is what is checked by 'Check_Has' and 'Check_Win'.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/deliver_gift",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the name of the person receiving the gift.",
      },
      {
        name: "Parameter2",
        type: "string",
        description:
          "A string representing the name of the gift being delivered.",
      },
    ],
    optional: [],
  },
  Drop_Item: {
    description:
      "Causes the player to drop their currently held item. If 'onplayer' is not set to true, then the item spawns out of bounds.\n\nIn games with a concept similar to Greyling Grove's 'Lost N Found', this command cannot act as a 'delete item' command, as the 'Lost N Found' would still bring the item back into bounds when used.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/drop_item",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [],
    optional: [
      {
        name: "onplayer",
        type: "bool",
        default: false,
        description:
          "A boolean value that when set to true, causes the dropped item to appear at or near the player. Defaults to false.",
      },
    ],
  },
  Give_Item: {
    description:
      "Attempts to give the player the named item, given that the player cannot accept the item due to a full inventory, the player will be forced to drop their current item into the world to make room for the new item.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/give_item",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description: "A string representing the name of the item to give.",
      },
    ],
    optional: [],
  },
  Set_Achievement: {
    description:
      "Unlocks the achievement, given it exists. Achievements with multiple unlock conditions are not supported (kind of).\n\nIn Greyling Grove, the achievement implementation allows for achievements to have 'requirements', which themselves are like hidden achievements, which can be used to create achievements that require multiple conditions or for something to happen multiple times.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/set_achievement",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the name of the achievement to unlock.",
      },
    ],
    optional: [],
  },
  Start_Credits: {
    description:
      "Instantly moves the game to the credits scene. Implemented as a hack to let Johny trigger the ending credits in Greyling Grove.",
    introducedVersion: "4.0.0",
    docUrl: "grovegame/start_credits",
    compatibleGames: ["Christmas at Greyling Grove"],
    required: [],
    optional: [],
  },
  Inc_Affection: {
    description:
      "Increases the affection of the character currently in conversation by one point, or by half a point if the optional parameter is provided.",
    introducedVersion: "4.0.0",
    docUrl: "ineptdategame/inc_affection",
    compatibleGames: ["Speed Dating for the Socially Inept"],
    required: [],
    optional: [
      {
        name: "half",
        type: "bool",
        default: false,
        description:
          "A boolean value, when set to true, the character’s affection is increased by only half a point. Defaults to false.",
      },
    ],
  },
  Show_Options: {
    description:
      "This command is a weird one. The definition of required and optional parameter get a bit grey here, so pay close attention to the description of the parameters to know how to write it.\n\nWhen called, this command will cause a set of options to appear, and will pause script execution until the player selects an option.",
    introducedVersion: "4.0.0",
    docUrl: "ineptdategame/show_options",
    compatibleGames: ["Speed Dating for the Socially Inept"],
    required: [
      {
        name: "Parameter1",
        type: "string",
        description:
          "A string representing the display text for the first option.",
      },
      {
        name: "Parameter2",
        type: "string",
        description:
          "A string representing the display text for the second option (for choices with only one option, do not supply this parameter).",
      },
      {
        name: "Parameter3",
        type: "string",
        description:
          "A string representing the display text for the third option (for choices with two or fewer options, do not supply this parameter).",
      },
    ],
    optional: [
      {
        name: "lm1",
        type: "string",
        description:
          "A string representing the name of the line marker to jump to when option one is selected. Technically required due to this, but is written like an optional.",
      },
      {
        name: "lm2",
        type: "string",
        description:
          "A string representing the name of the line marker to jump to when option two is selected. Required for choices with two or more options.",
      },
      {
        name: "lm3",
        type: "string",
        description:
          "A string representing the name of the line marker to jump to when option three is selected. Required for choices with three or more options.",
      },
    ],
  },
};
