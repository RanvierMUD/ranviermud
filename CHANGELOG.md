SPECIAL EFFECTS (0.4.1)
=======

This release focuses on the effects system. 
Previously, there were a lot of technical issues with effects: 
- There was no consistent format for them. 
- They were not flexible nor functional, in that they directly mutated the player's stats (for instance). This caused bugs.
- They could not be easily tied into the event emitter architecture.
- They did not persist after a player logged off.

Now all of that is fixed!

### Features:  
- There is now a small debuff effect when you flee from battle. It lasts for a short amount of time at lower levels and scales up.
- `effects` command allows you to see what effects you have, with a brief friendly description.

### Enhancements:
- Improved effects to be persistent, functionally change attributes instead of mutating, and have a consistent API.
- All existing effects have been recreated and improved upon.

### Bugfixes
- Now if you don't have a plugins folder on startup, the server will create one instead of crashing.
- Due to buggy API, effects would send duplicate messages on activate/deactivate. Now it is fixed.
- Bugs related to effects mutating player stats or not persisting have all been fixed.

### Technical Stuff:
- Effects on players persist.
- Effects have their own folder instead of all being in one giant messy file.
- Effects on items (enchantments?) should be easier to do now.
- Making new effects is way easier.
- Effects work on NPCs as well as players, though they don't persist between server reboots (yet).
- All older effects have been recreated as mentioned above.
- The new API should allow for easier effect management, for example allowing for potions to remove all negative effects.

### Coming Soon:
- Coordinate-based rooms
- Improvements to pathfinding
- Persisting containers/items/NPCs across server reboots
- Changes to NPCs to make the API match players
- Improved documentation/finishing graphs that I started a while back

#### COVERAGE:
Statements   : 33.54% ( 1455/4338 )
Branches     : 22.41% ( 383/1709 )
Functions    : 33.86% ( 85/251 )
Lines        : 33.6% ( 1323/3938 )


ITEMCEPTION (0.4.0)
=======

This release introduces a major overhaul to the items system, which will break older pfiles and probably older items.
There are now usable containers. Players can put items in containers, or take them out.
Containers can be nested, and have capacity limits based on both volume and weight.
Player inventory is now container-based. Meaning, you can hold/wield up to two items and besides that all of your items go into wearable containers.
Hooray for pockets!
There are also a lot of minor changes, fixes, and improvements, and likely some bugs from the aforementioned overhaul.

### Features:
- Containers for items.
- New inventory system.
- World can be setup to have items spawn inside containers and not just on the ground.

### Enhancements:
- Admin commands: @debugInv and @debugItems. Still pretty sketchy but can come in handy.
- Improved defiler scripts and messages.
- Improved Baxter's dialogue tree slightly.
- Improved login flow and made formatting of login messages more helpful and consistent between clients.

### Bugfixes:
- Fixed LOADS of inventory-related issues which I will omit since they were probably added when the features listed above were added.
- Fixed issue where items were not emitting their drop events if they were dropped while the player died.
- Increased server logging/debugging abilities, including adding longer stack traces.
- Fixed a breaking bug related to dying. Dying is still buggy but will be overhauled soonish anyway.
- Fixed issues with 'get all', 'remove all', 'drop all', and 'give'.
- Removed buggy effects. Effects to be refactored soon.
- Item behaviors were not persisting if they were in the player's inventory. Now they are.
- Fixed bug where the messages for a roach leaving the room and entering the room were the same...

### Technical stuff:
- Code coverage tool (istanbul) is now configured to ignore the 3rd party telnet server code, but it does include things such as scripts now.
- Also, a lot of tests are broken and won't be fixed anytime soon.
- Upgraded code to use features supported by Node 7.1.0, including destructuring, for/of, template strings.
- Refactored the ranvier server file.
- Methods dealing with adding/removing items and npcs are simplified.

#### COVERAGE:
Statements   : 31.49% ( 1341/4259 )
Branches     : 20.1% ( 338/1682 )
Functions    : 34.13% ( 71/208 )
Lines        : 31.38% ( 1213/3865 )


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
