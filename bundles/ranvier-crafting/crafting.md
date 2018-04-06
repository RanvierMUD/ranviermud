Crafting
---

Recipes are defined in 'data/recipes.yml' like so:

```
- item: "limbo:7" # target item to create
  recipe:
    plant_material: 3 # resource key: amount
    rose_petal: 1
```

For the player to get resources you'll need two things: one is to define the resource type in 'data/resources.yml'.
Second is to create a node for them to gather from. See areas/craft/items.yml for examples.
