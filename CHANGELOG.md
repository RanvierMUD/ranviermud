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
