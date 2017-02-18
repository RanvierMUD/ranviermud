Ranvier configuration is stored in the `ranvier.json` file in the root of the project.

### Options

`field` _`type`_ `(default)`

----

`port` _`number`_ `(23)`
:    Port that the game runs on

`webPort` _`number`_ `(9001)`
:    Port the web API runs on

`bundles` _`array<string>`_
:    List of enabled bundles, for details see the [Bundles](extending/bundles.md) section

`maxAccountNameLength` _`number`_ `(20)`
`minAccountNameLength` _`number`_ (3)
`maxPlayerNameLength` _`number`_ (30)
`minPlayerNameLength` _`number`_ (3)
`maxCharacters` _`number`_ (3)
:    Account and character creation validation settings

`allowMultiplay` _`boolean`_ `(false)`
:    If enabled players can log into multiple players on their account at once

`startingRoom` _`EntityReference`_ `("limbo:1")`
:    Room player is placed in when first created

`moveCommand` _`string`_ `("move")`
:    Name of the command that will handle when the character types a movement direction (See [`src/CommandParser.js`](https://github.com/shawncplus/ranviermud/blob/staging/src/CommandParser.js) for natively supported directions)

`defaultAttributes` _`object`_ 
:    See [`ranvier.json`](https://github.com/shawncplus/ranviermud/blob/staging/ranvier.json) for defaults. These are the starting attributes (health, mana, strength, etc.) that are assigned to characters upon creation

`skillLag` _`number`_
:    Defuault milleconds of lag to apply after a skill is used before they can use another skill. Can be configured per skill
