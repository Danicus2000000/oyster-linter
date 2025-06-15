# Oyster 4S Specification

## Command Names

### Base

- [Act_Append](commands/Act_Append.md),
- [Act_Speak](commands/Act_Speak.md),
- [Jump_To](commands/Jump_To.md),
- [Line_Marker](commands/Line_Marker.md),
- [Set_Looker](commands/Set_Looker.md),
- [Set_Name](commands/Set_Name.md),
- [Set_Script](commands/Set_Script.md),
- [Set_sprite](commands/Set_sprite.md),
- [Sys_Wait](commands/Sys_Wait.md).

### Christmas at Greyling Grove

- [Drop_Item](commands/Drop_Item.md),
- [Give_Item](commands/Give_Item.md),
- [Check_Has](commands/Check_Has.md),
- [Check_Win](commands/Check_Win.md),
- [Deliver_Gift](commands/Deliver_Gift.md),
- [Set_Achievement](commands/Set_Achievement.md),
- [Start_Credits](commands/Start_Credits.md).

### Speed Dating for the Socially Inept

- [Set_FOV](commands/Set_FOV.md),
- [Set_Colour](commands/Set_Colour.md),
- [Show_Options](commands/Show_Options.md),
- [Inc_Affection](commands/Inc_Affection.md),
- [Call_Puppet](commands/Call_Puppet.md).

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