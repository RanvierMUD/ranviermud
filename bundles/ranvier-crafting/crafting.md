Crafting
---

* Materials gathered from world nodes only, not from enemy drops
* New item type: RESOURCE
  * Need to create resource nodes as items in the new 'ranvier-crafting' bundle
  * Need new item behavior: 'resource'
    * Nodes should act like loot tables where they have the possibilty to drop a range of multiple resources with
      different percentage chances. Perhaps even reuse LootTable class
* New command: 'gather' to obtain resources
  * Argument is the parseDot-able target for the node to gather from
  * Node should be destroyed on gather such that respawn can recreate the node and allow for more gathering
  * Check against loot table of node to figure out which and how many of the resources to give the player
* Resources are not real items but stored as counts of resources obtained in player meta
* New command: 'resources' to view resources obtained
* New command 'craft'
  * Subcommand: 'list'
    * With no argument: list categories prefixed by their index, e.g., "1) Weapons"
    * with argument 'category', e.g., craft list 1: List all possible recipes in that category. Possible switch to only
      show recipes for which you have all the necessary ingredients. Should list similarly to category list, e.g.,
      "1) [Steel Broadsword]"
    * with argument 'category' and 'item', e.g., craft list 1 1: View item stats and recipe
  * Subcommand: 'create': will require 'category' and 'item' arguments from 'craft list', e.g., 'craft create 1 1'
    * For first iteration will immediately consume resources and give the player the item. Document/explore how one
      would add timers to the process.
