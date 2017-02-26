The help files are currently defined in [YAML](www.yaml.org/) and can specify some information about a topic, a command
(if applicable), and a list of related topics.

For example, here is the helpfile for the `inventory` command, found in `/bundles/ranvier-commands/help/inventory.yml`:
```
---
command: inventory
body: |
  View current items in your inventory
related:
  - equipment
  - get
  - drop
  - put
```

This is formatted for you and displayed to the player as:
```
---------------------------------------------------------------------------------
                                   inventory
---------------------------------------------------------------------------------
Syntax: inventory

View current items in your inventory
------------------------------------RELATED--------------------------------------
                           equipment, get, drop, put
---------------------------------------------------------------------------------
```

Helpfiles may also define a set of related keywords to help the user when searching for a topic, however, keyword
searches are as of yet unimplemented in the core engine. A topic's name is defined by the filename of the YAML
definition file, and it must be placed in the `/help/` subdirectory of a bundle.

At a bare minimum, a helpfile must have a body that is not an empty string.

For example, a minimal helpfile placed at `/example-bundle/help/contrived.yml` would work as defined here:
```
---
body: TODO
```

When a player enters the command `help contrived` they would be greeted with:
```
---------------------------------------------------------------------------------
                                   contrived
---------------------------------------------------------------------------------
TODO
---------------------------------------------------------------------------------
```

In future versions of Ranvier, the helpfiles may include scriptable dynamic content, for example `help admin` may show a
list of administrators, and `help [skillname]` may include the cost for the player to train the specified skill.
