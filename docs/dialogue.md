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
    find:  'thief'
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

So, if given the string ``"What can I do about the thieves guild?"``, this algorithm would weight this topic with 7 points, plus an additional 2 in case of a tie.   


## Dialogue types

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
