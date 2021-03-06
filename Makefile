GFX=$(shell cd src/gfx; ls *.xcf | sed -e "{ s/\(.*\).xcf/dist\/gfx\/\\1.png/}")
SFX=$(shell cd src/sfx; ls *.wav | sed -e "{s/\.*/dist\/sfx\/\\0/}")

dist/index.html: dist src/index.html dist/game.js $(GFX) dist/levels.json $(SFX)
	./node_modules/.bin/gulp build:index.html

dist:
	mkdir -p dist

dist/game.js: node_modules src/js/*.js gulpfile.js
	./node_modules/.bin/gulp build:js

dist/levels.json: dist src/scripts/mergeData.js src/data/levels/*.json
	node src/scripts/mergeData.js src/data/levels dist/levels.json

node_modules: package.json
	npm install
	touch node_modules

serve: node_modules
	npm run serve

dist/gfx:
	mkdir -p dist/gfx

dist/gfx/%.png: src/scripts/xcf2png.sh dist/gfx src/gfx/%.xcf
	src/scripts/xcf2png.sh $(basename $(@F))

dist/sfx:
	mkdir -p dist/sfx

dist/sfx/%.wav: dist/sfx src/sfx/%.wav
	cp src/sfx/$(@F) dist/sfx
