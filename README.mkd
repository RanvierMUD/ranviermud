<p align="center"><img class="readme-logo" src="https://raw.githubusercontent.com/RanvierMUD/docs/master/resources/logo.png"></p>

# ranvier

## Node.js-based MUD engine

Ranvier is a [MUD](https://en.wikipedia.org/wiki/MUD) game engine whose goal is to be a simple but powerful way to build whatever MUD you want with special care given to extensibility. The core code strives to be completely unopinionated toward any specific style of game while using the bundle system to build the game you want without having to dig through the engine's code.

## Special Features

* Robust bundle system: Nearly every aspect of the game can be modified without changing the core and allows for easy
  packaging and sharing of commands/areas/items/npcs/channels/behaviors
* Unopinionated network layer: easily swap out telnet for any network layer you like. No need to gut the whole codebase
  just to support a different transport type, just drop in a file.
* Customizable data layer: You are not tied to saving in any particular database or file storage sytem
* Optional coordinate based room system allowing for the flexibilty of a standard MUD world with the easy mappability of
  a strict 3D world.
* Scripting for all entities in the game for any event along with behaviors to create shared, composable scripts
* Skill system with passive/active skills
* Effects e.g., buffs/debuffs
* Quest system allowing for starting/progress/completion from any event in the game
* Communication channels with custom audiences

## Documentation

Ranvier prides itself on having thorough documentation which is available on our website: [ranviermud.com](https://ranviermud.com)

## Slack

We have a Slack channel you can use to ask questions, suggest features, or just keep up to date with the project: [https://ranviermud.slack.com](https://ranviermud.slack.com)

[Get an invite](https://join.slack.com/t/ranviermud/shared_invite/enQtODA1NTI4MTc5MjgyLWU1OTI2YTYxMTcwYTBjNmIyMzhmMWZmNTQ3ZmFiMWEwYjQ5N2MyYWQzODFhZDUwNmZiODE1ODVlNWE5NTlmYzU)

## Requirements

* [Node.js](https://nodejs.org) >= v10.12.0

## Demo

Point your favorite client or telnet to `ranviermud.com` port 4000. This demo server is wiped and updated from the `master` branch every hour.
