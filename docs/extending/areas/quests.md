Ranvier's quest system is left intentionally generic. However, this makes it incredibly powerful and extensible. 
In this guide we will implement a new quest goal type called FetchGoal (player needs to retrieve an item), create a
couple fetch quests, create a quest giver for one of the quests, and for the other create a room script that will
give the player a quest when walking into the room.

> <i class="material-icons md-36">info</i> Ranvier's _[ranvier-quests](https://github.com/shawncplus/ranviermud/tree/staging/bundles/ranvier-quests/lib)_ bundle already includes goals for fetching/equipping items, and killing npcs

[TOC]

## What is a Quest, exactly?

In Ranvier quests are defined as completable goals whose progress is saved. The core code makes no assumptions and has
no opinions on what those goals are, how the player progresses towards that goal, or the reward they get when they reach
it. That's up to you. To accomplish this all active quests receive all the same events that a player receives. As an
example, if a player picks up an item the `get` event will fire on the player. Any active quests will hear about this
`get` event at the same time and do as they please with that information.

## Creating the new Quest Goal

To have a quest that actually _does something_ you will first need to create a class which extends the core `QuestGoal`
class. Once you've created your custom goal type you can have as many quests as you like which use that goal, you
don't need to create a custom goal for each individual quest. But you will need one for each different type of quest,
e.g., a goal for kill quests, a goal for fetch quests, etc.

A fetch goal, we'll say, is one that

* requires the player to pick up a certain number of a certain item
* optionally removes the items from the players inventory on completion

First we will create a new bundle called `ranvier-quests`, we'll use this bundle as a library for all of our quest types.
And we'll create a file under this bundle in `lib/FetchGoal.js`. So you should have a directory structure that looks
like this:

```
bundles/
  ranvier-quests/
    lib/
      FetchGoal.js
```

```javascript
'use strict';

// Import core QuestGoal class
const QuestGoal = require('../../../src/QuestGoal');

/**
 * A quest goal requiring the player picks up a certain number of a particular item
 */
class FetchGoal extends QuestGoal {
  // Quest goal constructor takes the quest it's attached to, a configuration of
  // this particular goal, and the player the quest is active on
  constructor(quest, config, player) {
    // Here we'll add our custom configuration: removeItem, target item and count
    config = Object.assign({
      title: 'Retrieve Item',
      removeItem: false,
      count: 1,
      item: null
    }, config);

    // call parent constructor
    super(quest, config, player);

    /*
    All quests have a "state"; this is the part that contains any data that is relevant
    to the current progress of the quest. So in the constructor we will set the initial
    progress of this to simply be that the player hasn't picked up any of target item yet
    */
    this.state = {
      count: 0
    };

    // Setup listeners for the events we want to update this quest's progress
    this.on('get', this._getItem);
    this.on('drop', this._dropItem);
    this.on('decay', this._dropItem);
  }

  /*
  Because Quest has no opinions and makes no assumptions it requires you to tell it how to
  get the current progress of this type of goal based on its state and configuration. In
  our FetchGoal, progress is defined as how many items have they picked up out of how many
  they need to pick up in total.

  getProgress() should return an object like so:
  {
    percent: <number> 0-100 completion percentage,
    display: <string> What the user should see when the progress updates
  }
  */
  getProgress() {
    const percent = (this.state.count / this.config.count) * 100;
    const display = `${this.config.title}: [${this.state.count}/${this.config.count}]`;
    return { percent, display };
  }

  /*
  What should happen when the player completes the quest (or the game tries to complete it
  for the player automatically)
  */
  complete() {
    // sanity check to make sure it doesn't actually complete before it's supposed to
    if (this.state.count < this.config.count) {
      return;
    }

    const player = this.quest.player;

    // Here we implement our removeItem config
    if (this.config.removeItem) {
      for (let i = 0; i < this.config.count; i++) {
        for (const [, item] of player.inventory) {
          if (item.entityReference === this.config.item) {
            // use the ItemManager to completely remove the item from the game
            this.quest.GameState.ItemManager.remove(item);
          }
        }
      }
    }

    super.complete();
  }

  /*
  What should happen when the player picked up any item
  */
  _getItem(item) {
    // Make sure the item they picked up is the item the quest wants
    if (item.entityReference !== this.config.item) {
      return;
    }

    // update our state to say they progressed towards the goal
    this.state.count = (this.state.count || 0) + 1;

    // don't notify the player of further progress if it's already ready to turn in
    if (this.state.count > this.config.count) {
      return;
    }

    // notify the player of their updated progress
    this.emit('progress', this.getProgress());
  }

  /*
  If the player drops one of the requested items make sure to subtract that from their
  current progress
  */
  _dropItem(item) {
    if (!this.state.count || item.entityReference !== this.config.item) {
      return;
    }

    this.state.count--;

    // Again, don't notify the player of change in progress unless they can no longer
    // turn in the quest
    if (this.state.count >= this.config.count) {
      return;
    }

    this.emit('progress', this.getProgress());
  }
}

module.exports = FetchGoal;
```

## Creating Quests

The first step to using your fancy new `FetchQuest` type is to create the quests file:
`my-bundle/areas/my-area/quests.js`. Note that the `FetchQuest` class and the `quests.js`
file in this example are _not_ in the same bundle. They can be in the same bundle if you
like, but it may be easier to simply put all of your quest types in their own bundle
instead of spread out across your project.

The structure of the quests file is very similar to the other `.js` files that get loaded
in bundles.

```javascript
'use strict';

// Import our quest type
const FetchGoal = require('../../../ranvier-quests/lib/FetchGoal');

/*
The bundle loader expects the quests.js file to return a function which accepts the
path to the src/ directory of the project and return an object representing the list
of quests
*/
module.exports = (srcPath) => {
  // In this example I'm just importing some experience utilities to calculate exp rewards
  const LevelUtil = require(srcPath + 'LevelUtil');

  return {
    // Each quest is defined as an object keyed by its unique qid (Quest id)
    // this qid will be used as part of the EntityReference we'll see later
    1: {
      // our quest's config
      config: {
        // The title and description are required and are shown to the player often.
        title: "Find A Weapon",
        desc: "You're defenseless! Pick up the shiv from the chest by typing 'get shiv chest'",

        // as soon as all goals are at 100% progress complete this quest. Defaults to false
        autoComplete: true,

        // This reward function is called once the quest is completed. You can basically
        // do anything you want to reward the player, this example shows giving them some
        // experience
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(player.level) * 5);
        }
      },

      // setup the goals that the player has to complete for this quest
      goals: [
        {
          // Each goal has a `type` such as one we built above
          type: FetchGoal,
          // and a config, this is specific to each goal type
          config: {
            title: 'Retrieved a Sword',
            // this quest only requires the player pick up one of the target items
            count: 1,
            // which in this case is a sword
            item: "limbo:1",
          }
      ]
    },

    2: {
      // this quest is very similar except it's repeatable and once the player completes
      // the quest the cheese will be removed from their inventory
      config: {
        title: "One Cheese Please",
        desc: "A rat has tasked you with finding it some cheese, better get to it.",
        repeatable: true,
        reward: (quest, player) => LevelUtil.mobExp(player.level) * 3
      },
      goals: [
        {
          type: FetchGoal,
          config: {
            title: 'Found Cheese',
            count: 1,
            item: "limbo:2",
            removeItem: true,
          }
        }
      ]
    }
  };
};
```

In addition to the above Quest definitions can also include `requires` which is a list
of quest EntityReferences (`"limbo:1"`) which the player must complete before they can
start that quest.

## Giving the player a quest

Ranvier's core engine does not define when or how the player gets assigned quests so we'll
go over two examples of how you may want to do it.

### Questors

The easiest approach is to make an NPC a quest giver (questor). This functionality is not
a feature of the core engine itself but rather of the `quest` command in the `ranvier-quests`
bundle. If you would like to modify the base functionality of how questors work see that bundle.

The base functionality of questors also includes updates to the `look` command in
`ranvier-commands` which places small progress indicators next to the NPC's name when the
player sees the NPC in the room. For example:

```
[!] [NPC] Rat <-- The NPC has a quest available for the player
[%] [NPC] Rat <-- The player has a quest in progress given by this NPC
[?] [NPC] Rat <-- The player has a quest given by this NPC ready to be completed
```

To make an NPC a questor simply add a `quests` array to their definition in `npcs.yml` like so:

```
- id: 1
  keywords: ['rat']
  name: 'Rat'
  level: 2
  description: "The rat's beady red eyes dart frantically, its mouth foaming as it scampers about."
  quests: ['limbo:2']
```

The quests array is a list of quest EntityReferences, i.e., `<area the quests.js file is in>:<quest id>`.

Now when the NPC is loaded into the game the player can access the NPC's list of available
quests with `quest list rat`

### Scripts

While NPC quest givers are the easiest approach they are not the most flexible. Take for
example if you wanted to give a player a quest upon logging into the game, or when they
entered a certain room, or picked up a certain item. For this you will need to harness the
power of entity scripting. You can see more detailed documentation on scripting in
[Scripting](scripting.md).

In this example we will implement giving the player a quest (The "Find a Weapon!" quest
from above) when they enter a room.

Here we have the definition of room Test Room 1 from `rooms.yml` and we'll attach the
script`1-test` to the room.

```
- id: 1
  title: "Test Room 1"
  script: "1-test"
  ...
```

Now we need to create the scripts file `1-test.js` in the room folder of scripts. So your
bundles folder should now look like this:

```
...
my-bundle/
  areas/
    limbo/
      scripts/
        rooms/
          1-test.js
      manifest.yml
      items.yml
      npcs.yml
      quests.js
      rooms.yml
```

Now to create the `1-test` script, again more detail about the structure and
implementation of scripts can be found in the [Scripting](scripting.md) section.

```javascript
'use strict';

module.exports = (srcPath) => {
  return  {
    listeners: {
      // Set up a listener for when a player enters the room
      playerEnter: state => function (player) {
        // use the QuestFactory from the GameState to find quest `limbo:1` (Find a Weapon)
        let quest = state.QuestFactory.create(state, 'limbo:1', player);

        if (player.questTracker.canStart(quest)) {
          player.questTracker.start(quest);
        }

        // it's as simple as that: get the quest, check if the player can start it, start it
      }
    }
  };
};
```

Now when the player enters `Test Room 1` they will be given the quest `Find a Weapon` (if
they don't already have it active or have already completed it)
