# Tooling

Run from `tools/` with Bun and dependencies installed:

```sh
bun run bump 0.0.2
bun run zip --cli latest --modules relay/0.1.2 --skills latest
```

`bump` updates `VERSION` and adds a `CHANGES.md` heading. `zip` writes bundles to
`dist/` and requires `SANDBOX_RELEASES_TOKEN` with read access to the private
`asimov-systems/asimov-sandbox` releases. Module selectors are comma-separated
`name/version` tags: the prefix selects the module, and the entire tag is used verbatim.
`name/latest` selects that module's most recently published non-draft, non-prerelease release.

After committing and pushing the version and changelog, you can trigger a release on the
branch containing those changes (the version must match its `VERSION`):

```sh
gh workflow run release.yml --ref master \
  -f version=0.0.2 \
  -f cli=latest \
  -f modules=relay/0.1.2 \
  -f skills=latest
```
