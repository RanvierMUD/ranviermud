The Ranvier engine itself doesn't prescribe or prefer any certain type of combat, it simply has tools
in place to allow you to implement which ever type of combat you prefer. This bundle is an example
implementation of Diku-style autoattack combat. While it is an example implementation it is stable
enough to be used in your game should you choose not to replace it.

This bundle works by listening on the `updateTick` event for players and NPCs and then using a
custom `Combat` class (lib/Combat.js) to handle round timing, finding a target, doing damage, and
death. The `player-events.js` file binds to the events that `Damage` and `Heal` emit as well as
some custom events that the `Combat` class emits (`deathblow`, and `killed`).

NOTE: When using this bundle NPCs will not fight back if they are not given the `combat` behavior.
They will simply sit there as the player kills them.
