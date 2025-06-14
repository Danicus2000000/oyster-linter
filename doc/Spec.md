# Oyster 4S Specification

## Command Names

### Base

- Act_Append,
- Act_Speak,
- Jump_To,
- Line_Marker,
- Set_Looker,
- Set_Name,
- Set_Script,
- Set_sprite,
- Sys_Wait.

### Christmas at Greyling Grove

- Drop_Item,
- Give_Item,
- Check_Has,
- Check_Win,
- Deliver_Gift,
- Set_Achievement,
- Start_Credits.

### Speed Dating for the Socially Inept

- Set_FOV,
- Set_Colour,
- Show_Options,
- Inc_Affection,
- Call_Puppet.

## How conversations are read in

Firstly, commands are read in to be a command and a string array of parameters.

Then those are passed to each individual command, based on the command derived prior, where the command itself is responsible for translating those string parameters to the correct values for the command.

This creates the array of commands used to run the conversation itself, the command itself is responsible for telling Oyster to go to the next line or to skip to a different line.

The conversation ends when the last line ends.

## How commands are implemented

Commands implementations notify Oyster about their functionality by implementing certain interfaces.

### ISpeechCommand

This tells the speech system that this object is a speech command, it is the base interface that all commands are referenced by.

It forces the commands to implement:
```cs
public bool Run() { } // Called once per frame when speech system is running.
public ISpeechCommand MakeSelf(string[] rawParameters) { } // Called to make an instance of the relevant command.
```

### ILineMarker

This tells the speech system that this command is a type of line marker.

It forces the commands to implement:
```cs
public string Name { get; } // Access to the name parameter stored within Line_Marker.
```

### ITakesTime

This tells the speech system that this command takes time to complete.

It forces the commands to implement:
```cs
public void MakeItGoFaster() { } // When called, tells the command that we want it to go faster (given the command's parameters, it may just ignore this).
```

### ITextPusher

This tells the speech system that this command pushes text to the display.

It forces the commands to implement:
```cs
public bool HasCharactersRemaining { get; } // Whether this text pusher has finished pushing characters (Used to know when to display a 'click to continue' icon).
```
## How to supply parameters

Parameters are supplied in the following format:
```OScript
COMMAND [REQUIRED1, REQUIRED2, OPTIONAL1=VALUE, OPTIONAL2=VALUE]
```
Where:
- COMMAND is the speech command being used,
- REQUIRED1, REQUIRED2 are required parameter values in order,
- OPTIONAL1 and OPTIONAL2 are optional parameter names,
- VALUE for both of the above is separated from the parameter name by an '='.

## Parameter formatting

There are three supported data types:

### Strings

Supplied as:
```
"String content herrreeee"
```

### Integers

Supplied as:
```
1000
```

### Booleans

Supplied as:
```
True
False
```

## Writing a Line

A line in Oyster can be one of three things:

- A command,
- A blank line,
- A comment.

### A Command

These are written as shown in the 'How to supply parameters' section of the document.

### A blank line

It's as simple as it sounds, just leave a blank line and Oyster will ignore it when parsing the script.

### A comment

Comments start with '//' and may only span one line.
Comments cannot occur on the same line as a command.
An example would be:
```OScript
// I'm a valid comment

act_speak ["Pineapple"] // I'm going to cause problems!
```

### Act_Append (base)

#### Parameters

##### Required:

**Parameter1**: A string containing text to display.

##### Optional:

**instant**: A boolean describing whether the script should push all characters instantly or not, defaults to false.

**wait**: A boolean describing whether the script should wait for user input when done or not, defaults to true.

**mute**: A boolean describing whether Oyster should play any speech sounds while text is being pushed, defaults to false.

#### Functionality

Appends the given text to the end of the main text box.

### Act_Speak (base)

#### Parameters

##### Required:

**Parameter1**: A string containing text to display.

##### Optional:

**instant**: A boolean describing whether the script should push all characters instantly or not, defaults to false.

**wait**: A boolean describing whether the script should wait for user input when done or not, defaults to true.

**mute**: A boolean describing whether Oyster should play any speech sounds while text is being pushed, defaults to false.

#### Functionality

Replaces the contents of the main text box with the given text.

### Jump_To (base)

#### Parameters

##### Required:

**Parameter1**: A string representing the name of the line marker to jump to.

##### Optional:

*No optional parameters*

#### Functionality

Moves the current line-number to the line-number described by the line of the given name (implemented via Line_Marker), or does nothing if the given Line_Marker does not exist.

### Line_Marker (base)

#### Parameters

##### Required:

**Parameter1**: A string describing the name for this line marker.

##### Optional:

*No optional parameters*

#### Functionality

Informs the speech system that this line should be tracked as a line marker, by the given name.

### Set_Looker (base)

#### Parameters

##### Required:

**Parameter1**: A string describing the name of the desired look target.

##### Optional:

*No optional parameters*

#### Functionality

Attempts to swap the current look target to the object of the given name, if the target object is not present, it does nothing, if the value **'default'** is passed, it returns to the original look target always.

### Set_Name (base)

#### Parameters

##### Required:

**Parameter1**: A string representing the value to set for the name display.

##### Optional:

*No optional parameters*

#### Functionality

Changes the value of the name display in the conversation to the given name. **Does not change the name of the character beyond the scope of the current conversation**. Is intended to be used to spoof multiple characters, alongside Set_Looker.

### Set_Script (base)

#### Parameters

##### Required:

**Parameter1**: A string representing the name of the script to change the character to.

##### Optional:

*No optional parameters*

#### Functionality

Changes the script that the current character is pointing to to the given value, intended to allow for characters to change conversation between chats or based on given events. **Does not reload the script after being called, player has to manually re-enter conversation, nor does it cause the current conversation to end**.

### Set_sprite (base)

#### Parameters

##### Required:

**Parameter1**: A string representing the name of the sprite to swap to.

##### Optional:

*No optional parameters*

#### Functionality

Changes the current sprite to the one described by the above parameter, if the sprite does not exist, should swap to an error sprite.

### Sys_Wait (base)

#### Parameters

##### Required:

**Parameter1**: An integer representing the amount of time to wait for, in milliseconds

##### Optional:

**canSkip**: A boolean value describing whether the player can click to skip this wait or not.

#### Functionality

Waits for the given amount of time, or skips on player input, if that parameter is set

### Drop_Item (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Give_Item (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Check_Has (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Check_Win (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Deliver_Gift (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Set_Achievement (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Start_Credits (Christmas at Greyling Grove)
#### Parameters
##### Required:
##### Optional:
#### Functionality

### Set_FOV (Speed Dating for the Socially Inept)

#### Parameters

##### Required:

**Parameter1**: An integer value representing the target field of view in degrees.

##### Optional:

*No optional parameters*

#### Functionality

Updates Oyster's 'Target FOV' value, given the new value is different, Oyster will lerp to the new FOV value quickly while running other commands.

### Set_Colour (Speed Dating for the Socially Inept)

#### Parameters

##### Required:

**Parameter1**: The R value of the target colour.

**Parameter2**: The G value of the target colour.

**Parameter3**: The B value of the target colour.

**Parameter4**: The A value of the target colour.

##### Optional:

*No optional parameters*

#### Functionality

Sets the colour of the character's name to the parameters specified in one frame.

If all parameters are passed as '-1', then Oyster resets the text colour to its original value from the start of the conversation.

### Show_Options (Speed Dating for the Socially Inept)

#### Parameters

##### Required:

**Parameter1**: The display text for the first option.

**Parameter2**: The display text for the second option (for choices with only one option, do not supply this parameter).

**Parameter3** The display text for the third option (for choices with two or fewer options, do not supply this parameter).

##### Optional:

**lm1**: The name of the line marker to jump to when option one is selected. Technically required due to this, but is written like an optional.

**lm2**: The name of the line marker to jump to when option two is selected. Required for choices with two or more options.

**lm3**: The name of the line marker to jump to when option three is selected. Required for choices with three or more options.

#### Functionality

This command is a weird one. The definition of required and optional parameter get a bit grey here, so pay close attention to the description of the parameters to know how to write it.

When called, this command will cause a set of options to appear, and will pause script execution until the player selects an option.

### Inc_Affection (Speed Dating for the Socially Inept)

#### Parameters

##### Required:

*No required parameters*

##### Optional:

**half**: A boolean value, when set to true, the character's affection is increased by only half a point. Defaults to false.

#### Functionality

Increases the affection of the character currently in conversation by one point, or by half a point if the optional parameter is provided.

### Call_Puppet (Speed Dating for the Socially Inept)

#### Parameters

##### Required:

**Parameter1**: A string representing the command name.

##### Optional:

*No optional parameters*

#### Functionality

This entire command is one huge hack to speed up game development. Do not use it.

Internally, the 'puppet' is listening to Oyster and waiting for this command, each scene has its own specialised puppet that responds to specific things.

Effectively, this command allows for oddly specific pieces of functionality to be controlled through Oyster, without designing a new command. Making games in a week is tough.

Here is a list of valid 'Parameter1's:

##### Presenter's Scene

###### Contestant Display

- ShowContestantsDisplay,
- HideContestantsDisplay.

Enables or disables the contestant display.

- ShowContestantsPre,
- ShowNarin,
- ShowKarin,
- ShowEvelyn,
- ShowCeri,
- ShowNika,
- ShowMila.

Sets the image on the contestants display, all of them should be self explanatory, other than 'ShowContestantsPre' which simply shows a cover image, intended to be used to show a blank-ish screen before contestants get introduced.

###### Multi-Speaker Implementation

- SetSpeaker_All,
- SetSpeaker_Arthur,
- SetSpeaker_Dusk,
- SetSpeaker_Dawn,
- SetSpriter_Arthur,
- SetSpriter_Dusk,
- SetSpriter_Dawn.

The presenter scene does some hackery to get three characters all talking in one conversation. The main way it does this is by implementing its own set of scripts for what would usually make up a character, which contains its own code to manage each character separately, one at a time. Using any of these tells the respective script to swap to the stated character.

##### Main Date Room

- DateEnd,
- FadeOut,
- FadeIn.

These should all be self explanatory:

- DateEnd moves the game to the next day,
- FadeOut causes the screen to fade out,
- FadeIn causes the screen to fade in.