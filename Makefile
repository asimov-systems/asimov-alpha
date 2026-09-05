READMER = readmer

VERSION := $(shell cat VERSION)

all: README.md

README.md: .config/readmer/README.md.liquid
	$(READMER) render -Dversion=$(VERSION) $< > $@

.PHONY: all
.SECONDARY:
.SUFFIXES:
