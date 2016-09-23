# Dialogue

Non-player characters can engage in dialogue triggered by the 'say' command or the 'ask about' command.

Beginning dialogue is triggered with an 'introduce' command.

For example, a player in a room with an NPC named Umbra might see Umbra as "an enormous, green-skinned humanoid".
Then, they use 'introduce humanoid' and Umbra might say, "Hello, I am Umbra. I need help dealing with thieves."

An obvious dialogue choice would be triggered by either, `ask Umbra about thieves` or `say Tell me about the thieves.`, and it is possible to have these dialogue choices be triggered only after an introduction. NPCs might say some bits and pieces about things said in their presence but will mostly refuse to engage with you until you introduce yourself.


## Dialogue priority

Dialogue topics can also be prioritized, so that if you mention more than one topic in a sentence or ask about multiple topics' keywords, it will choose the highest priority topic.

Example dialogue config for a single topic:
``` javascript
'thieves guild': {
  priority: Dialogue.Priority.LOW,
  keywords: {
    every: 'guild',
    some:  ['thief', 'thieves', 'what'],
    find:  ['thief', 'guild']
  },
  dialogue: 'The cloaked figure says, "I need you to infiltrate the thieves guild for me, and find their roster."',
},
```

Which dialogue branch is triggered is based on the following criteria:
- Lowest, Low, Medium, High, Highest are worth 1 to 5 points, in order. This is used as a tie breaker, dependent on the following criteria.
- If the topic (key `'thieves guild'` in the example) is found verbatim, it is 1 point.
- If every single word in the "every" array/string is matched by `Array.prototype.every`, it is worth 3 points.
- If any word in the "some" array/string is matched by `Array.prototype.some`, it is worth 2 points.
- Each word in the "find" array/string that is matched by `String.prototype.find` is worth 1 point.

So, if given the string ``"What can I do about the dead thief from the thieves guild?"``, this algorithm would weight this topic with 9 points:
- 2 from priority
- 1 from the key
- 2 from `some`
- 2 from `find`


# Dialogue Types

As seen above, the `dialogue` property can have a string as a value. In this case, it would be a single line of dialogue where the NPC responds every single time using that same dialogue bit, if that topic ends up being highest priority.

However, there are more complex dialogue types:

``` javascript
'here': {
  priority: Dialogue.Priority.LOWEST,
  keywords: {
    some: ['here', 'this place', 'where'],
    find: ['wh'],
  },
  dialogue: [
    'The hobo says, "This is my favorite place."',
    '"It is so great here," says the hobo.',
  ],
},
```

If the dialogue is a plain array (as determined by `Array.isArray`), then it will choose a random response from the array of dialogue strings.

Another type:

## Timed Dialogue

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
  dialogue: Dialogue.timed([{
    say:   'We must seek vengeance.',
    delay: 2.5 * 1000
  }, {
    say:   'They have overstepped their bounds and must be put down.'
  }, {
    say:   'Go.'
  }]);
}
```

Woah, this is some weird stuff.

So, the dialogue here is defined as an array of objects, with a `say` property and a `delay` property.
`say`: The string the player will see. No say or action property will throw an error.
`action`: A function determining what the NPC will do. This function will be passed the npc, the player who triggered the initial dialogue, the player manager, the rooms manager, and [maybe?] the arg
`delay`: The amount of time that the NPC will wait before moving on to their next line or action, in milliseconds. Defaults to 1000 ms, or one second.

Before each blurb, the npc checks to see if the player who triggered the dialogue is still in the same room.
If they are not, the dialogue process ends.

### More on Priority

You noticed that the priority values were different in those past few examples. So, leverage that.
The priority can be an integer from 1 to 5 (expressed using enum-like variables)
or a function that returns one of those integers/enums.

The above `quest` example uses a function to check the player's level and set the priority based on whether or not they are in an appropriate level range for the quest.


### Prerequisites

Prerequisites are a function or array of functions, that returns a boolean. If it is undefined, then the dialogue has no prereqs. If it is an array of functions, each must resolve to true for the prereq to be met.

Some are predefined:

Example:
``` javascript
  'prerequisites': [ Prereqs.hasMet(player, npc) ],
```

``` javascript
Prereqs.hasMet = (player, npc) => () => player.hasMet(npc);
```

## Sequenced Dialogue
``` javascript
'the awakening': {
  priority: Dialogue.Priority.MEDIUM,
  keywords: {
    every: 'how was the tavern',
    some: Dialogue.Keywords.BACKSTORY,
    find: Dialogue.Keywords.BACKSTORY,
  }
  dialogue: Dialogue.sequence([
    '"This tavern was the most popular in the city, before the Awakening," he said.',
    '"I was a bit taller, then. More real," mutters the metahuman.',
    'He sighs heavily, "It was not a good time for me."'
  ]),
}
```

This is an array of dialogue choices that will be cycled through from beginning to end based on the last one the NPC said. So, each time that this dialogue topic is triggered, the NPC will say the next bit of dialogue.

Not sure if this will be done on a per-player basis or if the NPC will just rotate between dialogue choices regardless of which player triggered the dialogue, or if it will reset based on a timer. Will do a simple implementation for now.
