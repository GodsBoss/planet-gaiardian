GFX=$(shell cd src/gfx; ls *.xcf | sed -e "{ s/\(.*\).xcf/dist\/gfx\/\\1.png/}")

dist/index.html: dist src/index.html dist/init.js dist/game.js $(GFX)
	cp src/index.html dist

dist:
	mkdir -p dist

dist/init.js: src/js/init.js
	cp src/js/init.js dist

dist/game.js: src/js/game.js
	cp src/js/game.js dist

node_modules: package.json
	npm install
	touch node_modules

serve: node_modules
	npm run serve

dist/gfx: dist
	mkdir -p dist/gfx

dist/gfx/%.png: dist/gfx src/gfx/%.xcf
	src/scripts/xcf2png.sh $(basename $(@F))
