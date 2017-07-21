[TOC]

## Installation

    git clone git://github.com/shawncplus/ranviermud
    cd ranviermud
    npm install
    npm run bundle-install

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

By default Ranvier ships with an admin account with the username `admin` and password `ranviermud`. It's recommended
that after logging in you use the Change Password menu option to change the default password.

## Adding Content

To begin adding content you should first have an understanding of the [Project Structure](structure.md). After that all
of the details of adding content can be seen in the [Bundles](extending/bundles.md) section.

## Hotbooting

In general we, the developers of Ranvier, consider hotbooting to be a bad practice as it literally encourages working
"on live". To this end we encourage the following workflow for making changes to your game once it goes live:

* Create two checkouts of `ranviermud`: one you will use for development, and one you use for live.
* In your development repo create a `dev` branch
* For the dev branch change (but do not commit) the ranvier.json port to something different than the live port
* Make your changes in your dev repo on the dev branch, restarting the dev server when you make and want to test changes
* When you're happy with the changes you've made commit them to the dev branch, then merge them into the master branch
  - commit then: `git checkout master`, `git merge --ff-only . dev`

When you want to deploy your changes to your live server:

* Move into your live repo and add your dev repo as a remote: `git remote add dev /path/to/dev/repo`
* Pull in the master changes: `git fetch dev`, `git pull`
* Restart the server

In the future we might add functionality to make the development process easier with a `hotboot` command that is only
active when in a certain 'environment' but for now the above workflow is what we recommend for the best player
experience.
