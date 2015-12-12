dist/index.html: dist src/index.html
	cp src/index.html dist

dist:
	mkdir -p dist
