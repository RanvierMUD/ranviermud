'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const Dialogue  = require('../../src/dialogue').Dialogue;
const util = require('util');

exports.listeners = {

  spawn: l10n => {
    return function (room, rooms, players) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const msg = this.getShortDesc('en') + ' yawns and stretches, pulling itself up from behind the bar.';
      toRoom({ thirdPartyMessage: msg });
    }
  },

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 15);
      if (rand === 3) {
        const msg = '<bold>The ginger tomcat mewls, doffing his monocle.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, rooms, player, players, npc, npcs, item) => {
      const rand = Random.inRange(1, 15);
      if (rand === 3) {
        const itemDesc = item.getShortDesc('en');
        const msg = '<bold>The cat\'s whiskers twitch as he eyes the ' + itemDesc + '.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerSay: l10n => {
    return function _talk(player, players, rooms, npcs, args) {
      const npc = this;
      const serpentsHissKeywords = [
        'serpent',
        'serpents',
        'hiss',
        'tavern',
        'bar',
        'fang',
        'downstairs'
      ];

      //TODO: Extract to dialogue or level utils?
      const giveExpFor = (topic, points) => () => {
        topic = topic || 'the history of the tavern';
        const isDiscussing = true;
        if (!player.hasDiscussed(npc, topic, isDiscussing)) {
          player.emit('experience', points || 50, topic);
        }
      };

      const hasMet = () => player.hasMet(npc);

      const serpentsHissDialogue = [{
        say: '"This tavern has been around for as long as I\'ve been around, for what that\'s worth," the cat murmurs, licking its paws.',
        action: giveExpFor('the age of the half-abandoned tavern, the Serpent\'s Hiss'),
      }, {
        say: '"My humans used to run this place," the cat says, glancing up at you. "Their kit is still in the basement."',
        action: giveExpFor('the former owners of the Serpent\'s Hiss', 75),
      }, {
        say: '"Since the Quarantine, I\'ve been taking care of the place," the cat purrs, "I locked the upstairs room and the cellar door.  For good reason."',
        action: giveExpFor('the Quarantine, and the duties of a curious cat', 100)
      }];

      const quarantineDialogue = [{
        say: '"Ah, yes," Baxter nods, "that is what those who were left behind call it. The changed ones."'
      },
      {
        say: '"The other humans all left. Or tried to leave." He looks wistful for a second.',
        delay: 2000
      },
      {
        say: '"Or, they died," he finishes, licking his lips. "Some were good meat, others bad."',
        delay: 1500
      },
      {
        say: '"Everything has changed, since. What was a city is now a trap," the cat waxes, adjusting his monocle.',
        action: giveExpFor('the effects of the Quarantine, according to Baxter', 200)
      }];


      const npcDialogueTree = {
        npc, player,

        'where am i': {
          priority: Dialogue.Priority.LOW,
          keywords: {
            every: 'this place',
            some:   serpentsHissKeywords,
            find:   Dialogue.Keywords.HERE.concat(serpentsHissKeywords)
          },
          dialogue: {
            type:    Dialogue.Types.RANDOM,
            choices: serpentsHissDialogue
          },
          prerequisite: hasMet
        },

        'what is the quarantine': {
          priority: Dialogue.Priority.LOW,
          keywords: {
            every: 'quarantine',
            some: ['the quarantine', 'quarantining', 'history of the'],
            find: Dialogue.Keywords.QUARANTINE
          },
          dialogue: {
            type:     Dialogue.Types.TIMED,
            sequence: quarantineDialogue
          },
          prerequisite: hasMet
        },

        // Next dialogue branch...

      };

      const room   = rooms.getAt(this.getLocation());
      const toRoom = Broadcast.toRoom(room, this, player, players);
      Dialogue.handleInteraction(npcDialogueTree, args, toRoom);

    }
  },

  playerYell: l10n => {
    return function _respond(player, players, rooms, npcs, args) {
      const npcRoom = this.getLocation();

      if (player.getLocation() === npcRoom) {
        player.say('<yellow>The cat looks at you, annoyed, and hisses.</yellow>');
        //TODO: Lower reputation with cat. Use emitter to handle this. Use a behavior file.
      }

      players.broadcastIf(
        '<blue>The cat looks annoyed, and hisses.</yellow>',
        p => p !== player && p.getLocation() === npcRoom);
    }
  },
  hit: l10n => {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const playerName = player.getShortDesc('en');

      if (!this.getEffects('flurry')) {
        player.say('<yellow>The cat pounces on you with a flurry of blows!');
        this.addEffect('flurry', {
          duration: 6 * 1000,
          activate: () => {
            this.combat.addSpeedMod({
              name: 'ferocious feline',
              effect: speed => Math.round(speed * .75)
            });
            this.combat.addDamageMod({
              name: 'ferocious feline',
              effect: damage => damage + 10
            });
          },
          deactivate: () => {
            this.combat.deleteAllMods('ferocious feline');
          }
        })
      }


      let secondPartyMessage, thirdPartyMessage;

      //TODO: Extract this to some kind of combat messaging helper?
      switch(hitLocation) {
        case 'head':
          secondPartyMessage = ['The tomcat flies at your face, a ball of fur, his claws <red>raking</red> your eyes.'];
          thirdPartyMessage = ['The tomcat flies at '+ playerName + '\'s face, a ball of fur, his claws <red>raking</red> their eyes.'];
          break;

        case 'neck':
          secondPartyMessage = ['The ginger cat <red>tears</red> at your throat, screeching.'];
          thirdPartyMessage = ['The ginger cat <red>tears</red> at ' + playerName + '\'s throat, screeching.'];
          break;

        default:
          secondPartyMessage = [
            'The tomcat\'s claws rake your ' + hitLocation + ', drawing <red>lines</led> <white>of</white> <red>blood</red>.',
            'The cat fiercely <yellow>nips</yellow> your ' + hitLocation + '.',
            'A <bold>screeching</bold> ball of fur, the tomcat sinks its claws into your ' + hitLocation + '.'
          ];
          thirdPartyMessage = [
            'The tomcat <red>rakes</red> ' + playerName + '\'s' + hitLocation + ' with his sharpened claws.',
            'The cat quickly nips ' + playerName + '\'s ' + hitLocation + ' and darts away, an orange <yellow>flash</yellow>.',
            'The cat <bold>flies</bold> through the air at ' + playerName + ' and sinks his claws in their ' + hitLocation + '.'
          ];
          break;
      }

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const moderateDamage = damage < (this.getAttribute('health') * .8);

      const whackedInHead = hitLocation === 'head' && damage > 10;
      if (whackedInHead && !this.getEffects('monocle broke')) {
        this.addEffect('monocle broke', {
          duration: 15 * 1000,

          activate: () => {
            player.say('<bold>You whack the cat in the head and his monocle cracks.</bold>');
            this.combat.addToHitMod({
              name: 'monocle broke' + damage,
              effect: toHit => toHit - 3
            });
          },

          deactivate: () => {
            this.combat.removeToHitMod('monocle broke' + damage);
            player.say('<white>The sassy feline swaps out their broken monocle for a fresh one.</white>')
          }
        });
      }

      const secondPartyMessage = moderateDamage ?
      [
        'The cat screeches in anguish.',
        'The tomcat leaps back, to lick his <red>wounds</red> for a second.',
        'The tomcat is knocked back by the blow, his monocle <bold><cyan>popping</cyan></bold> loose for a second.',
        'The cat\'s ' + hitLocation + ' is <blue>bruised</blue> by your strike.'
      ] :
      [
        'The tomcat\'s '+ hitLocation + ' is smashed open, and his <red>blood</red> spatters on the floor.'
      ];
      const thirdPartyMessage = moderateDamage ?
      [
        'The cat screeches in pain as its ' + hitLocation + ' is <blue>bruised</blue>.',
        'The tomcat retreats after ' + player.getShortDesc('en') + '\'s vicious attack, to lick his <red>wounds</red>.',
        'The tomcat is bashed away by ' + player.getShortDesc('en') + ', and his monocle <bold>pops</bold> loose.',
        'The tomcat\'s ' + hitLocation + ' is bashed, and begins <blue>swelling</blue> immediately.'
      ] :
      [
        'The cat\'s '+ hitLocation + ' is smashed to a furry ginger <red>pulp</red>, thanks to ' + player.getShortDesc('en') + '.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The cat leaps away from your strike, and bows ironically.',
        'Your attack hits nothing but fur as the cat darts past you.',
        'The tomcat jumps out of the way, and you swear it laughs at you.',
      ];
      const thirdPartyMessage = [
        'The cat leaps away from ' + player.getShortDesc('en') + '\'s attack.',
        player.getShortDesc('en') + '\'s attack hits nothing as the tomcat runs circles around them.',
        'The sassy tomcat jumps away ' + player.getShortDesc('en') + ', causing them to miss his ' + hitLocation + '.',
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        '<yellow>The tomcat leaps for your ' + hitLocation + ', but flies past in a blur of claws.</yellow>',
        '<yellow>The tomcat\'s claws miss your ' + hitLocation + '.</yellow>',
        '<yellow>The cat adjusts his monocle after missing your ' + hitLocation + '.</yellow>',
      ];
      const thirdPartyMessage = [
        '<yellow>The tomcat leaps for ' + player.getShortDesc('en') + '\s ' + hitLocation + ', but flies past in a blur of claws.</yellow>',
        '<yellow>The tomcat claws at ' + player.getShortDesc('en') + ' but whiffs.</yellow>',
        '<yellow>The classy cat adjusts his monocle after missing ' + player.getShortDesc('en') + '.</yellow>',
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  introduction: function(l10n) {
    return function(player, players, room) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const playerName = player.getName();

      //TODO: Use the timed dialogue method for this bit, if possible.
      const secondPartyMessage =
        '<bold>The cat rears up on his hind legs and considers you for a moment.</bold>\n' +
        '<magenta>"Welcome to my tavern, human,"</magenta> he mews in a droll tone.\n' +
        '<magenta>"I know not why you have come here. But I do have a proposition for you...."</magenta>\n' +
        'He trails off, licking his paws.\n' +
        '<magenta>"Say, do you like salmon?"<magenta>';
      const thirdPartyMessage =
        '<bold>The cat rears up on his hind legs and considers ' + playerName + ' for a moment.\n<bold>' +
        '<magenta>"Welcome to my tavern, human,"</magenta> he mews in a droll tone.\n' +
        '<magenta>"I know not why you have come here. But I do have a proposition for you...."</magenta>\n\n' +
        'He trails off, licking his paws while staring at ' + playerName + '.\n' +
        '<magenta>"Say, do you like salmon?"<magenta>';

      toRoom({ secondPartyMessage, thirdPartyMessage });

      const doMoreDialogue = () => {
        if (player.getLocation() === this.getLocation()) {
          const secondPartyMessage =
            '<magenta>"Sorry, a non-sequitir,"</magenta> the tomcat mumbles, half to himself.\n' +
            '<magenta>"I can also answer any questions you have about this tavern,"<magenta>\n' +
            '<magenta>"...or the creatures in the basement."</magenta>';
          const thirdPartyMessage =
            '<magenta>"Sorry, a non-sequitir,"</magenta> the tomcat mumbles, half to himself and half to ' + playerName + '.\n' +
            '<magenta>"I can also answer any questions you have about this tavern,"<magenta>\n' +
            '<magenta>"...or the creatures in the basement."</magenta>';

          toRoom({ secondPartyMessage, thirdPartyMessage });
        }
      }

      setTimeout(doMoreDialogue, 3500);

    }
  },

  /* No enter and leave script since this NPC is stationary for now. */

};
