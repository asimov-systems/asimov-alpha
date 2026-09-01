READMER = readmer

all: README.md

README.md: .config/readmer/README.md.liquid
	$(READMER) render $< > $@

.PHONY: all
.SECONDARY:
.SUFFIXES:
