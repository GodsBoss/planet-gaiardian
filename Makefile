dist/index.html: dist src/index.html
	cp src/index.html dist

dist:
	mkdir -p dist

node_modules: package.json
	npm install
	touch node_modules
