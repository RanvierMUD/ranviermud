# Dialogue

Players can engage NPCs in dialogue via the `say` command.

For the most part, players must use the `introduce` command to initialize dialogue with an NPC and open up dialogue branches.
This also will prompt the player as to a few potential topics the NPC may be willing to talk about.
Introducing oneself to NPCs will also replace their room description with their name for future interactions.

For example, a player in a room with an NPC named Umbra might see Umbra as "an enormous, green-skinned humanoid".
Then, they use 'introduce humanoid' and Umbra might say, "Hello, I am Umbra. I need help dealing with thieves."

An obvious dialogue choice would be triggered by `say Tell me about the thieves.`, and it is possible to have these dialogue choices be triggered only after an introduction. For the most part, NPCs won't engage with you much until you introduce yourself.

## Configuring/Building Dialogue Trees

There is some cruft around building dialogue, but for the most part it is done with Javascript objects, strings, and functions. Commonly used keywords and functions will be extracted for readability and ease of use for new developers/builders.
Here are some examples of the features that are used when crafting a dialogue tree.

### Dialogue priority

Dialogue topics are prioritized, so that if you mention more than one topic in a sentence or ask about multiple topics' keywords, it will choose the highest priority topic.

Example dialogue config for a single topic:
``` javascript
'thieves guild': {
  priority: Dialogue.Priority.LOW,
  keywords: {
    every: ['thieves', 'guild'],
    some:  ['thief', 'thieves', 'what'],
    find:  ['thief', 'guild']
  },
  dialogue: {
    type: Dialogue.Types.SIMPLE,
    say: 'The cloaked figure says, "I need you to infiltrate the thieves guild for me, and find their roster."',
    action: () => beginQuest('thieves_guild_1')
  },
},
```

Which dialogue branch is triggered is based on the following criteria:
- A pre-set priority (key `priority` in the example) Lowest, Low, Medium, High, Highest are worth 1 to 5 points, in order.
- If the topic (key `'thieves guild'` in the example) is found verbatim, it is 1 point.
- If _every_ string in the "every" array/string is matched, it is worth 3 points.
- If _any_ string in the "some" array/string is matched, it is worth 2 points.
- _Each_ string in the "find" array/string that is matched is worth 1 point.

These are all tallied. Tie breaker method is TBD.

So, if given the string ``"What can I do about the dead thief from the thieves guild?"``, this algorithm would weight this topic with 9 points:
- 2 from pre-set priority
- 1 from the key
- 2 from `some`
- 2 from `find`

#### Custom Priority

The following `quest` example uses a function to check the player's level and set the priority based on whether or not they are in an appropriate level range for the quest.

Priorities can be a function that returns an integer OR an integer. The built-in `Dialogue.Priority` constants are really just integers 1-5 under the hood.


## Dialogue Types

As seen above, the `dialogue` object has a `type` property. The `SIMPLE` type denotes a single line of dialogue and/or action, in response to being triggered.

However, there are more complex dialogue types:

### Random Dialogue

``` javascript
'here': {
  priority: Dialogue.Priority.LOWEST,
  keywords: {
    some: ['here', 'this place', 'where'],
    find: ['wh'],
  },
  dialogue: {
    type: Dialogue.Types.RANDOM
    choices: [
      { say: '"I love it here," says the hobo.'},
      { say: '"This is my favorite place," the hobo says.'}
    ]
  }
},
```

In this case, `RANDOM`, the dialogue object must have a `choices` property which is an array of objects. As seen in the `SIMPLE` example, the dialogue can have words to `say` or have an `action` (which must be a function). The response will be chosen randomly from the array each time it is triggered.

Another type:

### Timed Dialogue

``` javascript
'quest': {
  priority:
    () => {
      const level = { min: 5, max: 10 };
      const playerLevel = player.getAttribute('level');
      const withinLevelRestriction = playerLevel < level.min || playerLevel > level.max;
      return withinLevelRestriction ? Dialogue.Priority.HIGHEST : Dialogue.Priority.LOW;
    },
  keywords: {
    some: Dialogue.Keywords.QUEST.concat(['two']),
    find: Dialogue.Keywords.QUEST.concat(['two']),
  },
  dialogue: {
    type: Dialogue.Types.TIMED,

    sequence: [{
      say:   '"We must seek vengeance," she growls',
      delay: 2.5 * 1000
    }, {
      say:   'She continues, "They have overstepped their bounds and must be put down."'
    }, {
      say:   '"Go."'
      action: () => beginQuest('thieves_guild_2')
    }]
  }
}
```

The `TIMED` dialogue is similar to `RANDOM` in structure. It denotes dialogue that will be said/acted on in order, from first to last, with an optional `delay` parameter (in milliseconds, defaulting to 1500).

Before each blurb, the npc checks to see if the player who triggered the dialogue is still in the same room.
If they are not, the dialogue process ends. So, if the player left before this dialogue ended, the quest would not officially start (this is probably bad design and is a totally contrived example).

Also, note the use of a function to set the priority, and the use of pre-packaged keywords.

### Prerequisites

Prerequisites are a function or array of functions, that returns a boolean. If it is undefined, then the dialogue has no prereqs. If it is an array of functions, each must resolve to true for the prereq to be met.

Eventually, commonly used functions will be prepackaged, just like Types/Keywords for Dialogue...
``` javascript
hasMet = (player, npc) => () => player.hasMet(npc);
```
Example:
``` javascript
'the awakening': {
  priority: Dialogue.Priority.MEDIUM,
  keywords: {
    every: 'how was the tavern',
    some: Dialogue.Keywords.BACKSTORY,
    find: Dialogue.Keywords.BACKSTORY,
  }
  prerequisite: Dialogue.Prereqs.hasMet // unimplemented as of yet...
  dialogue: {
    type: Dialogue.Types.RANDOM,
    choices: [
      { say: '"This tavern was the most popular in the city, before the Awakening," he said.' },
      { say: '"I was a bit taller, then. More real," mutters the metahuman.' },
      { say: 'He sighs heavily, "It was not a good time for me."' }
    ]
  }
}
```

THE END... FOR NOW.
