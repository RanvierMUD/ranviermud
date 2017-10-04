Ranvier configuration is stored in the `ranvier.json` file in the root of the project.

### Options

`field` _`type`_ `(default)`

----

`port` _`number`_ `(4000)`
:    Port that the game runs on. Note, port < 1024 may require that you run the ./ranvier executable with sudo.

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

`skillLag` _`number`_
:    Default milleconds of lag to apply after a skill is used before they can use another skill. Can be configured per skill

`logfile` _`string`_
:    Filename to be used for logging. Optional; by default Ranvier will only log to the console. Logs will be in the `/log/` directory and will always end in `.log`.

`defaultMaxPlayerInventory` _`number`_ `(16)`
:    Default maximum number of items players can carry. NPCs default to Infinity.

`maxIdleTime` _`number`_ `(20)`
:    Maximum number of minutes a player can idle without entering any commands before being automatically kicked. Remove this key/value pair or set it to 0 to disable autokicking idle players.

`playerTickFrequency` _`number`_ `(100)`
:    Number of milliseconds between `updateTick` events on players. Might want this to be faster (16ms) if using websockets.

`entityTickFrequency` _`number`_ `(100)`
:    Same as `playerTickFrequency` but for game entities (areas, rooms, npcs, items)
