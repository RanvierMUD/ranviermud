[TOC]

## Installation

    git clone git://github.com/shawncplus/ranviermud
    cd ranviermud
    npm install

If you would like to use the latest, but perhaps not stable, features: before `npm install` execute `git checkout staging`

## Running the server

    sudo ./ranvier

## Connecting

In another terminal execute `telnet localhost 23` or use your favorite MUD client with hostname `localhost` and port 23

By default Ranvier ships with an admin account with the username `admin` and password `tester`

## Server Configuration

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

`startingRoom` _`EntityRefernce`_ `("limbo:1")`

## Adding Content

To begin adding content you should first have an understanding of the [Project
Structure](structure.md). After that all of the details of adding content can
be seen in the [Bundles](extending/bundles.md) section.
