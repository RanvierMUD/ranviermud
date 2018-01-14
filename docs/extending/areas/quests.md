Ranvier's quest system is left intentionally generic. However, this makes it incredibly powerful and extensible.  In
this guide we will:

* Create a new quest goal type called FetchGoal (player needs to retrieve an item)
* Create a new reward type called ExperienceReward to reward the player experience for completion
* Create a couple fetch quests
* Create a quest giver for one of the quests
* Create a room script that will give the player a quest when walking into the room

> <i class="material-icons md-36">info</i> Ranvier's _[ranvier-quests](https://github.com/shawncplus/ranviermud/tree/staging/bundles/ranvier-quests/lib)_ bundle already includes goals for fetching/equipping items and killing npcs. It also includes
reward types for experience (as outlined in this guide) and currency

[TOC]

## What is a Quest, exactly?

In Ranvier quests are defined as completable goals whose progress is saved. The core code makes no assumptions and has
no opinions on what those goals are, how the player progresses towards that goal, or the reward they get when they reach
it. That's up to you. To accomplish this all active quests receive all the same events that a player receives. As an
example, if a player picks up an item the `get` event will fire on the player. Any active quests will hear about this
`get` event at the same time and do as they please with that information.

In order to create any quests in Ranvier you must define the types of goals and rewards. These goal and reward types,
once created, can be reused in the quests you create regardless of the area they are in. For example, you may have many
quests that require you to find some object so they would all use the `FetchGoal` but with differing configuration.
Likewise you may have many quests which reward experience, as such you would reuse the `ExperienceReward` with differing
configuration for each one.

This setup allows you to have programmers build the goal and reward types and the builders simply specify which type
to use and a configuration for that type when creating the quest with no coding needed.

## Creating a new goal type

To have a quest that actually _does something_ you will first need to create a class which extends the core `QuestGoal`
class. Once you've created your custom goal type you can have as many quests as you like which use that goal, you
don't need to create a custom goal for each individual quest. But you will need one for each different type of quest,
e.g., a goal for kill quests, a goal for fetch quests, etc.

We'll define a fetch goal as one that

* requires the player to pick up a certain number of a certain item
* optionally removes the items from the players inventory on completion

First we will create a new bundle called `my-quests`, we'll use this bundle as a library for all of our quest types.
And we'll create a file under this bundle in `quest-goals/FetchGoal.js`. So you should have a directory structure that looks
like this:

```
bundles/
  my-quests/
    quest-goals/
      FetchGoal.js
```

Quest goals follow the familiar `srcPath` closure structure used in entity scripts, commands, etc.

```javascript
'use strict';

module.exports = srcPath => {
  // Import core QuestGoal class
  const QuestGoal = require(srcPath + 'QuestGoal');

  /**
   * A quest goal requiring the player picks up a certain number of a particular item
   */
  return class FetchGoal extends QuestGoal {
    // Quest goal constructor takes the quest it's attached to, a configuration of
    // this particular goal, and the player the quest is active on
    constructor(quest, config, player) {
      // Here we'll have our custom config extend some default properties: removeItem, target item and count
      config = Object.assign({
        title: 'Retrieve Item',
        removeItem: false,
        count: 1,
        item: null
      }, config);

      // Call parent QuestGoal constructor
      super(quest, config, player);

      /*
      All quests have a "state"; this is the part that contains any data that is relevant
      to the current progress of the quest. So in the constructor we will set the initial
      progress of this to indicate that the player hasn't picked up any of the target item yet
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
    Because Quest has no opinions and makes no assumptions, it requires you to tell it how to
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
      // Sanity check to make sure it doesn't actually complete before it's supposed to
      if (this.state.count < this.config.count) {
        return;
      }

      const player = this.quest.player;

      // Here, we implement our removeItem config.
      // If removeItem is true, we remove all copies of the item from the player's inventory
      // once the quest is complete.
      if (this.config.removeItem) {
        for (let i = 0; i < this.config.count; i++) {
          for (const [, item] of player.inventory) {
            if (item.entityReference === this.config.item) {
              // Use the ItemManager to completely remove the item from the game
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
  };
};
```

## Creating a new reward type

Generally players complete quests for some reward so let's create the `ExperienceReward` reward type. This, as you would
imagine, will give the player some amount of experience upon completing a quest. All reward types go in the
`quest-rewards/` directory of a bundle. In our case we should have a directory structure that looks like this:

```
bundles/
  my-quests/
    quest-rewards/
      ExperienceReward.js
```

Rewards also follow the `srcPath` closure structure.

```javascript
'use strict';

module.exports = srcPath => {
  // Import core QuestReward class
  const QuestReward = require(srcPath + 'QuestReward');

  /**
   * Quest reward that gives experience
   *
   * Config options:
   *   amount: number, default: 0, static amount of experience to give
   */
  return class ExperienceReward extends QuestReward {

    /*
    IMPORTANT: Reward classes are used statically
    */

    /**
     * The reward method is called when the player has completed the quest and
     * we want to actually assign the reward.
     *
     * The method accepts the GameState object allowing you to access the other
     * factories/managers for doing things like creating effects/accessing
     * areas/etc., the quest instance, the configuration of the reward
     * as defined by the builder, and the player to receive the reward.
     */
    static reward(GameState, quest, config, player) {
      // This is a very simple reward in that it emits an event that will
      // be handled elsewhere for actually incrementing the player's experience,
      // leveling them up, etc.
      player.emit('experience', config.amount);

      // However, you are free to do as you wish in here
    }

    /**
     * the display() method is given the same parameters as reward() and is not
     * directly used by the core but you may use it in your commands to display
     * the rewards to the player. The default `ranvier-quests` bundle calls this
     * when the player looks at their quest log, for example.

     * The method returns a string, that's it.
     */
    static display(GameState, quest, config, player) {
      return `Experience: <b>${config.amount}</b>`;
    }
  };
};
```

### Reward ideas

Some other ideas for reward types could be `CurrencyReward`, or `SkillReward`. A
non-traditional reward might be something like `FollowupReward` which assigns
another quest upon completing the previous which could be used to implement a
quest chain. Think outside the box and use your imagination for coming up with
interesting quest reward types for your builders. Be sure to make your reward
types generic enough that they can be configured as-needed by your builders.

## Creating Quests

Now that we have a goal type and a reward type our builder is free to create
their quest. Creating a quest is very similar to creating items, npcs, or rooms.
Inside your area folder, next to your `items.yml`, and `rooms.yml` you will have
a `quests.yml`. The area need not be in the same bundle as the goal and reward
types. In our case we will have a directory structure that looks like this:

```
bundles/
  my-areas/
    areas/
      some-area/
        items.yml
        npcs.yml
        ...
        quests.yml <-- this is where we will put our quests for this area
```

The structure of the `quests.yml` file is very similar to the `items.yml` file, i.e., it is a YAML array of quest definitions

```yaml
---
-
  # Since this quest is id: 1 and is in area "some-area" its EntityReference will
  # be "some-area:1"
  id: 1

  # Quests have an optional level you can use for whatever you wish, the core
  # does not use this for anything
  level: 1

  # if autoComplete is true the quest will trigger the complete event as soon
  # all of its goals are fulfilled. Otherwise you will need a command such as
  # the `quest complete` command (defined in the `ranvier-quests` bundle) to
  # make the quest complete
  autoComplete: true

  # Description and title are not used by the core but should be used by your
  # commands (such as `quest log` in the `ranvier-quests` bundle) to display
  # information to the user. title, description, and completionMessage may all
  # contain color tags.
  title: "A Journey Begins"
  description: |-
     - Use 'get sword chest' to get your first weapon

  # There is also an optional completionMessage which, again, isn't used by the
  # core but you can use it to display additional content after the quest is
  # complete
  completionMessage: |-
    The rat looks like it is hungry, use '<white>quest list rat</white>' to see what aid you can offer. Use '<white>quest start rat 1</white>' to accept their task.

  # Here is where we get to use the goals we defined above
  goals:
    -
      # Quests may have multiple goals, each entry has a type which is the
      # filename of the goal type we defined but with the `.js` removed.
      type: FetchGoal

      # Here is the configuration for the goal. Aside from `title` every goal
      # will have its own configuration options so consult the goal type for its
      # available options.
      config:
        title: Find a Weapon
        count: 1
        item: 'limbo:1'
  
  # Rewards are defined exactly like goals and you may have multiple rewards
  # as well.
  rewards:
    -
      type: ExperienceReward
      config:
        amount: 5
        leveledTo: quest

# Here is another example quest. This one, however, is repeatable
-
  id: 2
  title: "One Cheese Please"
  level: 1,
  description: |-
    A rat has tasked you with finding it some cheese, better get to it.
  repeatable: true,
  goals:
    - type: FetchGoal
      config:
        title: Found Cheese
        count: 1
        item: "limbo:2"
        removeItem: true
  rewards:
    - type: ExperienceReward
      config:
        amount: 100
```

In addition to the above, Quest definitions can also include a `requires` property, which is a list
of quest EntityReferences (`"limbo:1"`) which the player must complete as prerequisites before they can
start that quest. This allows you to create an entire questline or branching multi-part quests.

The quest system at this time does not have the ability to do sequential goals,
i.e., a quest wherein the next goal does not appear and may not be completed
until the previous goal is finished. This is currently planned but for the time
being a quest with multiple goals will allow the goals to be completed in any
order.

## Giving the player a quest

Ranvier's core engine does not define when or how the player gets assigned quests so we'll
go over two examples of how you may want to do it.

### Questors

The easiest approach is to make an NPC a quest giver (questor). This
functionality is not a feature of the core engine itself but rather of the
`quest` command in the `ranvier-quests` bundle. If you would like to modify the
base functionality of how questors work, see the commands directory of that
bundle.

The base functionality of questors also includes updates to the `look` command
in `ranvier-commands` which places small progress indicators next to the NPC's
name when the player sees the NPC in the room. For example:

```
[!] [NPC] Rat <-- The NPC has a quest available for the player
[%] [NPC] Rat <-- The player has a quest in progress given by this NPC
[?] [NPC] Rat <-- The player has a quest given by this NPC ready to be completed
```

To make an NPC a questor simply add a `quests` array to their definition in `npcs.yml` like so:

```yaml
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

While NPC quest givers are the easiest approach, they are not the most flexible. For
example, if you wanted to give a player a quest upon logging into the game, or when they
entered a certain room, or picked up a certain item. For this, you will need to harness the
power of entity scripting. You can see more detailed documentation on scripting in
[Scripting](scripting.md).

In this example, we will implement giving the player a quest (The "Find a Weapon" quest
from above) when they enter a room.

Here we have the definition of room Test Room 1 from `rooms.yml` and we'll attach the
script `1-test` to the room.

```yaml
- id: 1
  title: "Test Room 1"
  script: "1-test"
  ...
```

Now we need to create the scripts file, `1-test.js`, in the room folder of scripts. So your
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

Now, to create the `1-test` script (again, more detail about the structure and
implementation of scripts can be found in the [Scripting](scripting.md) section):

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

        // It's as simple as that: get the quest, check if the player can start it, start it
      }
    }
  };
};
```

Now, when the player enters `Test Room 1` they will be given the quest `Find a Weapon` (assuming
they don't already have the quest activated or completed).

## Displaying progress/completion

Quests expose four player events that you can listen for to show a player's progress.
The `ranvier-quests` bundle registers some basic handlers by default to show WoW-like progress
notifications.

```
bundles/
  ranvier-quests/
    player-events.js
```

```javascript
'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      /**
       * When the player begins a quest
       * @param {Quest} quest
       */
      questStart: state => function (quest) {
        B.sayAt(this, `\r\n<bold><yellow>Quest Started: ${quest.config.title}!</yellow></bold>`);
        if (quest.config.desc) {
          B.sayAt(this, B.line(80));
          B.sayAt(this, `<bold><yellow>${quest.config.desc}</yellow></bold>`, 80);
        }
      },

      /**
       * When any quest updates its progress
       * @param {Quest} quest
       * @param {object} progress See QuestGoal.getProgress for object format
       */
      questProgress: state => function (quest, progress) {
        B.sayAt(this, `\r\n<bold><yellow>${progress.display}</yellow></bold>`);
      },

      /**
       * When a non-autoComplete quest has 100% progress across all of its goals
       * @param {Quest} quest
       */
      questTurnInReady: state => function (quest) {
        B.sayAt(this, `<bold><yellow>${quest.config.title} ready to turn in!</yellow></bold>`);
      },

      /**
       * Fired when a quest is completed, automatically or explicitly by a player command
       * @param {Quest} quest
       */
      questComplete: state => function (quest) {
        B.sayAt(this, `<bold><yellow>Quest Complete: ${quest.config.title}!</yellow></bold>`);
      }
    }
  };
};

```
