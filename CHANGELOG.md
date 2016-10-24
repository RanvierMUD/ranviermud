NEEDFUL THINGS (0.3.4)
========

This release introduces some enhancements to items, NPCs, and combat, as well as many bugfixes.
Items now have prerequisites based on your character's attributes. If you character does not meet the prerequisites for an item they have equipped, they face penalties that scale depending on how much they fall short of the prereqs. On the other hand, if they meet all of the prerequisites, they may receive a bonus of some kind.

### Features:
- Item prerequisites!

### Enhancements:
- Room descriptions for all items and NPCs.
- Improved NPC dialogue by properly weighting topics.
- Added weight to items.
- Implement weight limit based on character stamina.
- New weapon added!
- Added prerequisites to existing weapons.
- Improve combat balance -- slightly slower pace, less chance that you and an enemy will just constantly dodge each other.
- Add dodge attribute to NPCs to determine their ability to dodge attacks.
- Add additional effects to support prerequisite penalties.
- Make combat modifiers persist even if the player logs off (so they cannot log off to remove item-based penalties)

### Bugfixes:
- Server would crash on player's death during combat.
- Stun and charm feats did not work properly anymore.
- Wielding a weapon in your offhand did not activate custom weapon scripts.
- Wearing anything did not emit custom item scripts.
- Removing items was bugged.
- Dropping an equipped item dropped the item but kept it quipped.
- Lockpicking would crash the server.

### Technical stuff:
- Added unit tests for items manager and item class.
- Refactored item manager/item class.
- Added array.find proxy for items, NPCs, players, rooms.
- Added debugChar admin command to spot buggy behavior more easily.

#### COVERAGE:

Statements   : 31.17% ( 911/2923 )
Branches     : 17.42% ( 208/1194 )
Functions    : 19.05% ( 32/168 )
Lines        : 31.65% ( 834/2635 )


TALKING BACK (0.3.3)
========

This release made NPCs slightly more than just things for you to kill for experience! Now, they talk back, as long as you kindly `introduce` yourself first.

### Features:
- A dialogue system! See /docs/dialogue.md for information on setting up dialogue for new NPCs. NPCs will react to the `say` command, as long as the player has done `introduce [npc]` first.
- NPCs can now have Names. Their short description is shown until the player `introduces` themselves.

### Enhancements:
- Minor text fixes to:
  - Examine scripts
  - Trying to wield with two weapons wielded will tell you both weapons you are already holding
- Secondwind feat: Now increases player speed for a short burst, with a 'hangover' afterwards where the player becomes slower for a duration.
- Assense Aura feat: not fully implemented, but it increases mental attributes passively for now.
- Improved combat balance so it's not just constant dodging.
- Adjust attribute and level descriptions to match the soft maximum.
- Character level is more of a factor in combat and feat powers
- Added a 'deathblow' event, by default players can earn XP now even if another player is the one who killed the NPC, as long as they are in the same room.

### Bugfixes:
- `i` was doing the new `introduce` command rather than `inventory`, fixed.
- Fixed a bug with leatherskin/ironskin that was being surpressed anyway.
- Examining the booth room was buggy.
- The script for npcs leaving a room was broadcasting both the leaving and arriving events in the room they left from.

### Technical Stuff
- Dialogue stuff is documented.
- Added CHANGELOG.md including some past release notes.
- Added more tests (See below)
- Refactored NPC and Player methods for keeping track of combatants, to make it easier to eventually add multi-participant combat.
- Made default respawn duration really long, since restarting the server disconnects all remote connections and crashes the server if anyone is connected. Goal for next release is to refactor the server respawn function.


#### COVERAGE:

Statements   : 29.77% ( 827/2778 )
Branches     : 15.08% ( 173/1147 )
Functions    : 14.93% ( 30/201 )
Lines        : 30.41% ( 765/2516 )


FLESHING (0.3.2)
========

So, this one was a huuuuge release in terms of attention-to-detail type improvements, and technical stuff. This feature makes it a bit more enjoyable to play, and sets the MUD up for addition of a lot of exciting features.

### Features:
- No major features.

### Enhancements:
- Minor text fixes to:
  - Level-up text
  - Character command display
  - Duplicate messaging or prompting all over, now removed.
  - EXP gain message.
- Rebalanced leveling and NPCs.
- MASSIVE IMPROVEMENTS to scripting for NPCs, items, and player. Items and NPCs now have their own unique scripting for every combat event as well as several other events.
- Athletics skill decreases energy cost of various actions.
- Improve aggro script to be smarter/less buggy.
- Add parrying skill.
- Improve and rebalance combat.
- Now players are notified when NPCs respawn instead of them magically appearing in the room.
- Added more rooms to the game world, to be enhanced in future releases.
- Characters auto-look at the room they are in when signing on.
- Characters auto-regen very slowly even when not resting, meditating, etc.
- Stun lowers an enemy's chance to dodge.

### Bugfixes:
- Now prereq check for purchasing new feats actually works. Previously, you would pass the check as long as you met at least one prereq.
- "Remove all", "drop all", and "wear all" had issues.
- Password was validated on entry but not on account creation. It should have been the other way around.
- Attempting to "wear" a weapon caused errors. Now it wields it.
- Various error handlers have been added to handle network errors.
- Doors and locks were wonky. You could go through a locked door without the key. Now that is fixed.
- Fixed bug where a player could target a nonexistent location on an NPC and still hit it.
- Fixed bug where mental health damage resulted in mental health status being set to NaN.

### Technical Stuff
- So, I ended up getting a Digital Ocean droplet and putting up a test server. Thanks to all of those who helped find bugs! I'll credit you in the documentation somehow, if you want. Contact me if you want to do alpha testing.
- Added a load of unit tests, particularly around the doors/locking module.
- Added lcov reports... I'll put them at the bottom of each release. They're pretty dismal.
- Added a docs folder. Started graphing out the leveling progression to balance it better, but first I have to learn d3js and svg. Also documented how feats work.
- Considering putting this in its own repo as it has diverted a lot from the original ranviermud. So, watchers, stay tuned. This would also allow for a wiki and for submission of github issues and PRs more easily.

#### COVERAGE:

Statements   : 21.02% ( 584/2778 )
Branches     : 6.8% ( 78/1147 )
Functions    : 7.96% ( 16/201 )
Lines        : 22.58% ( 568/2516 )



# Reshape (0.3.2)

Mostly refactoring and bugfixing, to make it easier to add several upcoming planned features. Sit tight.

### Technical Jargon
- Added a combat helper class and combat utils file to organize everything combat-related. Now, NPCs and players have common APIs for everything combat related which should simplify multi-participant combat as well as PvP combat.
- Helper functions file. Somewhat released as fnk on npm, with some additional utils that ranviermud doesn't use. Check it out. Less code re-use.
- Refactored the multi-stage events, and put them each in their own files. Now it is more organized and adding new multi-stage events or editing the existing ones should be easier.
- Doors module. Everything dealing with doors or locks is now in its own file. Hooray physics.
- Duck typing. There are now functions to test if something is of a certain class. There are only really 4-6 classes in the game so far so I just included the most important ones. This is mostly needed as things grow more modular and have some common APIs but with implementation differences.

### Features
No user facing features, really.

### Bugs fixed
Quite a few.

### Bugs introduced
Quite a few, probably. Sigh.

### Enhancements
They're coming. There are way more hooks now for event emitters which will eventually make the world more reactive and hopefully immersive.




# Accountability (0.3.0)

Accounts and unit tests. I must be a masochist.

### Features:
* Player accounts, which:
  * are created upon login
  * can have up to three (active) characters
  * contain information shared between characters, such as account password and score
  * are stored in handy dandy JSON and persisted, of course

### Tech Debt:
* Unit tests now exist for player characters and accounts.
* Some cleanup of events.js, also some breaking of it.
* Miscellaneous bug fixing and game balancing.

The next release will probably deal with permadeath and/or more technical debt.

This release contains *breaking changes* so any old playerfiles won't really work with this, unless you make an account first then manually edit the account and player JSON files to be associated with each other.
