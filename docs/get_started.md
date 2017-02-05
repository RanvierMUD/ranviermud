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

Options are described below as `key (default value)`

`port` (23)
:    Port that the game runs on

`webPort` (9001)
:    Port the web API runs on

`bundles`
:    List of enabled bundles, for details see the [Bundles](bundles.md) section

`maxAccountNameLength` (_20_)
`minAccountNameLength` (_3_)
`maxPlayerNameLength` (_30_)
`minPlayerNameLength` (_3_)
`maxCharacters` (_3_)
:    Account and character creation validation settings

`allowMultiplay` (_false_)
:    If enabled players can log into multiple players on their account at once
