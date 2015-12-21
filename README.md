# Planet Gaiardian

Made for [Ludum Dare #34](http://ludumdare.com/compo/2015/12/09/welcome-to-ludum-dare-34/)!

## The game

You are Omniplant, the Planet Gaiardian. Your purpose is to let a planet's
life grow.

Every planet is its own level. You run around the planet, choose your tool and
use it on the things you come along.

The controls are easy: One button to switch to the next tool in the line,
the other button to use it.

## Requirements

To build the game, you need:
- [GIMP](http://www.gimp.org/)
- [GNU Make](https://www.gnu.org/software/make/)
- [Node](https://nodejs.org/)
- [Node package manager](https://www.npmjs.com/)

## TODO

### Technical stuff

These are after-Ludum-Dare-cleanup items.

- Split game.js into multiple files.
- JS build process / minification.
- Fix PNG creation script so it does not show exceptions anymore.
- Preload level data earlier and retrieve sprite keys and image URLs from there,
  remove most of this information from the code.
- Automatic tests. At least some of the functions and constructors should be
  testable and therefore tested.

### Features / Enhancements

- Save progress so it survives a reload.
- Bind sounds so the same item plays always the same sound. A non-working usage
  should play its own, distinct sound.
- Make rotation speed configurable per level.
