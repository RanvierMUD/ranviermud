# Dialogue

Non-player characters can engage in dialogue triggered by the 'say' command or the 'ask about' command.

Beginning dialogue is triggered with an 'introduce' command.

For example, a player in a room with an NPC named Umbra might see Umbra as "an enormous, green-skinned humanoid".
Then, they use 'introduce humanoid' and Umbra might say, "Hello, I am Umbra. I need help dealing with thieves."

An obvious dialogue choice would be triggered by either, `ask Umbra about thieves` or `say Tell me about the thieves.`, and it is possible to have these dialogue choices be triggered only after an introduction. NPCs might say some bits and pieces about things said in their presence but will mostly refuse to engage with you until you introduce yourself.

Dialogue topics can also be prioritized, so that if you mention more than one topic in a sentence or ask about multiple topics' keywords, it will choose the highest priority topic.

Example dialogue config for a single topic:
``` javascript
'thieves guild': {
  keywords: ['thieves', 'thief', 'stealing', 'guild'],
  priority: 4,
  prereqs: {
    introduced: true
  },
  dialogue: 'I need you to infiltrate the thieves guild for me, and find their roster. No need for you to know why, but trust me, I can pay you well.'
}
```
