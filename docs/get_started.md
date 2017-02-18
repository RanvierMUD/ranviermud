[TOC]

## Installation

    git clone git://github.com/shawncplus/ranviermud
    cd ranviermud
    npm install

If you would like to use the latest, but perhaps not stable, features: before `npm install` execute `git checkout staging`

## Running the server

    sudo ./ranvier

If you do not have sudo privileges or do not wish to run as sudo you should configure Ranvier to run on a port > 1024. See [Server Config](server_config.md)

## Connecting

In another terminal execute `telnet localhost 23` or use your favorite MUD client with hostname `localhost` and port 23. (If you have customized the port, replace 23 with whatever port you have configured Ranvier to use)

By default Ranvier ships with an admin account with the username `admin` and password `tester`

## Adding Content

To begin adding content you should first have an understanding of the [Project Structure](structure.md). After that all of the details of adding content can be seen in the [Bundles](extending/bundles.md) section.
