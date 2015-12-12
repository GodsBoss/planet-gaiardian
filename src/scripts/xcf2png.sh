#!/bin/bash

gimp -i -b "(let* ((image (car (gimp-file-load RUN-NONINTERACTIVE \"./src/gfx/$1.xcf\" \"$1.xcf\")))
	(helper-layer (car (gimp-image-get-layer-by-name image \"Helpers\"))))
	(if image helper-layer (gimp-image-remove-layer image helper-layer))
	 (file-png-save RUN-NONINTERACTIVE image (car (gimp-image-merge-visible-layers image EXPAND-AS-NECESSARY)) \"./dist/gfx/$1.png\" \"$1.png\" 0 9 0 0 0 0 0)
	(gimp-quit 0))"
