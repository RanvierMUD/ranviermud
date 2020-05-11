Hey, you want to help make Ranvier better? That's awesome. If you're new to the world of open source Github has a great
guide to get you started [https://guides.github.com/activities/contributing-to-open-source/](https://guides.github.com/activities/contributing-to-open-source/).

## Talking with the team

Before you start writing code, adding documentation, or submitting issues we suggest you hop in our slack channel
([Get an invite](https://join.slack.com/t/ranviermud/shared_invite/enQtMzczMDU3MDkxODc5LWVjZmUwNjBmNGFjYjZjOTM2OTcyMDMzZTJjZmNlOWZjNWJmNjVmMTg4ODFmOWQ3Yjg2Y2U5OTIyYTgyZTE2ZTA)) and say hi.

## Donating

Ranvier is a passion-project and I never expect to make money off of it. With that said, if you want to buy me a beer because you like Ranvier so dang much you can do so at my Patreon: [patreon.com/shawncplus](https://patreon.com/shawncplus). More than money though I appreciate contributions of the other types on this page: submitting bugs, suggesting features, and the very best: pull requests.

## Filing bugs

If you find an issue click the _Issues_ tab on the github page, there will be a template to walk you through what info
you should include in your report. We also suggest you hop in the above slack channel and let us know, we may be able to
resolve your issue right then and there!

## What to work on

If you are new to the open source world or even a veteran who just wants an easy introduction to the Ranvier codebase
check the issue list for issues with the [help wanted](https://github.com/shawncplus/ranviermud/labels/help%20wanted) label.
 _help wanted_ issues are non-critical bugs or features that are particularly easy or provide a good introduction to
a certain Ranvier subsystem.

## Documentation

If you're not sure where to get started contributing to Ranvier the best place to start is documentation. Read over the
existing documentation, read through some of the code, try to build something and get a feel for what is missing from
the docs that you could add.

Documentation is stored in the `docs/` folder in the root of the project. Our documentation is rendered with `mkdocs`
version 0.17.x and the Python-Markdown extensions, any markup you can use from those is free game. If you want to change
the look and feel of the documentation styles are in `docs/_mkdocs/theme/ranvier/assets/stylesheets/application.css`

You can test your changes to the docs locally by installing [mkdocs](http://www.mkdocs.org/) version 0.15.0 (version is important) and running `mkdocs serve`
from the root of the repo.

## What is and isn't part of Ranvier?

An example of something that _would_ be desired for a code contribution:

* Yes: A bugfix for code in `src/`.
* Yes: A bugfix or feature for code in one of the bundles prefixed with `ranvier-`.
* Maybe: A feature for code in `src/`. This might have some discussion around it depending if it changes any of the data
  models or impacts existing bundles.
* No: Your bundles. The end goal will be to have a place, like npm, where you can register your bundles for other
  Ranvier users to download. For now as long as your bundle is on github you can submit an issue for us to link to your
  bundle from our documentation.

## Code Standards

For the most part you can follow the style guide outlined in [https://github.com/airbnb/javascript](https://github.com/airbnb/javascript)
and you'll be safe. There are some differences but it's close enough that if you follow it we won't reject the PR on
style terms alone. When in doubt look at existing code in the repo.

## Default Bundles

The default bundles (bundles prefixed with ranvier-) are meant to be a functional example of a Diku-style MUD built in
the Ranvier engine. It is not intended to be a SMAUG-esque turnkey MUD where it comes with 80 areas and 200 commands and
tells you exactly what kind of game you have to build.

The commands in the default bundles, while inspired from classic Diku style MUDs have output inspired by modern MMOs
like World of Warcraft. Very little information is obscured from the player as was common practice in old MUDs. Combat
shows damage, items show their stats, you see enemy health, quests are much less puzzle-like and more direct.

Suggested changes/additions to those bundles should be made with that in mind.

## Submitting your code

Ranvier works by letting you build on top of it so fixing bugs and submitting them can sometimes lead to you
submitting more code than you intended. To prevent this isolate your bug fix, re-clone Ranvier into another directory and
apply your fix/feature to the fresh clone. That way when you send your pull request it won't included any of the custom
bundles you've built or changes you have made to the core that perhaps don't fit the criteria above.
