[TOC]

## Installation

    git clone git://github.com/shawncplus/ranviermud
    cd ranviermud
    npm install

If you would like to use the latest, but perhaps not stable, features: before `npm install` execute `git checkout
staging`

### Yeoman Generator

To make the creation of new bundle content easier Ranvier also has a Yeoman generator to generate the folders, files,
and boilerplate for you. This is optional but will save a lot of time when extending Ranvier.

    npm install -g yo
    npm install -g generator-ranvier

After installation type `yo ranvier` to see the usage.

## Running the server

    ./ranvier

## Connecting

In another terminal execute `telnet localhost 4000` or use your favorite MUD client with hostname `localhost` and port 4000.
(If you have customized the port, replace 4000 with whatever port you have configured Ranvier to use)

By default Ranvier ships with an admin account with the username `admin` and password `ranviermud`

## Adding Content

To begin adding content you should first have an understanding of the [Project Structure](structure.md). After that all
of the details of adding content can be seen in the [Bundles](extending/bundles.md) section.
