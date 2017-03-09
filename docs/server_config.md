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
