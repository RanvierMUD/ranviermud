'use strict';

const { Logger, QuestGoal } = require('ranvier');

module.exports = class BountyGoal extends QuestGoal {
  constructor(quest, config, player) {
    config = Object.assign({
      title: 'Locate NPC',
      npc: null, // NPC ID to capture
      home: null // Area ID to return to
    }, config);

    super(quest, config, player);

    this.state = {
      found: false,
      delivered: false
    };

    this.on('enterRoom', this._enterRoom);
  }

  getProgress() {
    // Has target been located?
    let percent = this.state.found ? 50 : 0;

    if (this.config.home) {
      // Has target been returned home?
      percent += this.state.delivered ? 50 : 0;
    } else {
      // No return location necessary.
      percent += 50;
    }

    const display = this.state.found ? 'Complete' : 'Not Complete';
    return { percent, display };
  }

  _enterRoom(room) {
    if (this.state.found) {
      if (room.entityReference == this.config.home) {
        // Check if we have taken the NPC home
        this.state.delivered = true;
      }
      this.emit('progress', this.getProgress());
    } else {
      let located = false;
      const goalNpcId = this.config.npc;
      if (goalNpcId !== null) {
        room.npcs.forEach(npc => {
          if (npc.entityReference == goalNpcId) {
            located = true;
            npc.follow(this.player);
          }
        });
      } else {
        Logger.error(`Quest: BountyGoal [${this.config.title}] does not have target npc defined.`);
      }
      if (located) {
        this.state.found = true;
      }
      this.emit('progress', this.getProgress());
    }
  }
};
