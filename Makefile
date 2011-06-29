BUILD_NUMBER ?= 0

all: version

version:
	m4 -D__BUILD__=$(BUILD_NUMBER) lib/version.js.m4 > lib/version.js

.PHONY: all version
