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

# Christmas at Greyling Grove

- Drop_Item,
- Give_Item,
- Check_Has,
- Check_Win,
- Deliver_Gift,
- Set_Achievement,
- Start_Credits.

# Speed Dating for the Socially Inept

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

## Command Explanations

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