What are mutations/mutagens/manifestation?
==========================================

These would likely be called "Feats" or "Talents" in D&D, Pathfinder, or most other MUDs.

Backstory:
Ranvier takes place in the titular city, where horrific pseudoscientific experiments have caused denizens of the now-quarantined city to be able to mutate themselves at will, and upon death, to be reborn into a new body.

Mutations are special abilities that can be `manifest`ed if your character meets all of the prerequisites and has a specific number of `mutagen`s. To see which mutations you have, and which you may manifest, type `mutations`.

Example:

```
ironskin: {
  type: 'passive',
  cost: 2,
  prereqs: {
    'stamina':   4,
    'willpower': 2,
    'level':     5,
    feats: ['leatherskin'],
  },
```

Mutations can be active or passive (meaning always on). Active mutations have a command to use them which you can see by typing `mutations`.

Ironskin, for example, costs 2 mutagens to manifest, and requires your player character to be level 5, and have 4 stamina and 2 willpower. In addition, they must already have the leatherskin mutation.

Once a mutation is manifested, it is permanent.

TO BE IMPLEMENTED:
===================

Eventually, mutations will change your character's physical description, as well as their aura.
