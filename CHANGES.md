# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.8.0 - 2026-10-28
Looking up followers, following, and mutuals through ASIMOV is now at least 10×
faster. Also improved instructions for your agent to know which specific X,
Instagram, GitHub, LinkedIn, and Luma links ASIMOV can presently look up for
you.
### Changed
- Listing followers, followees, and mutuals is at least 10× faster
- Improve the ASIMOV skill's instructions for better Grok Bot usability
- Prepare to discontinue pre-0.8.0 ASIMOV Alpha clients
- Upgrade to ASIMOV CLI 25.9.0 and ASIMOV SDK 25.9.0
### Fixed
- Update TLS certificate verification for CA security fixes
- Fetch and list X list members correctly
- Autodetect more system proxy settings on corporate networks
- Retry actions automatically when temporarily rate-limited

## 0.7.0 - 2026-10-18
### Added
- Support fetching multiple URLs in remote requests to minimize roundtrips
- Improve token efficiency by selecting fetch/list output properties with
  `--json=FIELDS`, applied after `--jev` but before `--jq` filters/transforms
- Fall back to `ASIMOV_RELAY_URL` for `asimov fetch` and `asimov list`
  when no enabled module handles the URL, with HTTP requests signed by the CLI
- Support SOCKS proxies with proxy-side DNS via `socks5h://` relay URLs
- Load `$ASIMOV_ROOT/.env` first prior to the nearest `.env` file, if any
- Automatically discover & cache remote public keys to verify signed responses
### Changed
- Upgrade to asimov-cli 25.8.1 and asimov-sdk 25.8.0
- Create `$ASIMOV_ROOT/.env` on install/upgrade to configure `ASIMOV_RELAY_URL`
- Use the platform's TLS certificate verification for remote connections, cloud
  services, and module management; Linux remote connections use system or
  explicitly configured CA certificates
- Default remote requests to 10-second connection and 60-second response-header
  and body-idle timeouts, with no total time limit for progressing streams
### Fixed
- Honor native HTTP proxy settings on macOS and Windows, including macOS proxy
  bypass lists and simple-hostname exclusions
- Preserve explicit system DNS resolution for remote requests
- Require refreshing the bundled agent skill on upgrades and reinstalls
### Removed
- Remove the obsolete asimov-relay-module from the bundled modules

## 0.6.1 - 2026-10-12
### Fixed
- Avoid keychain access for commands that only need the public key
### Changed
- Upgrade to asimov-cli 25.7.3 and asimov-sdk 25.7.3

## 0.6.0 - 2026-10-11
### Added
- Attio: Read people and companies from local workspace exports
### Changed
- Bundle asimov-attio-module 0.1.1

## 0.5.1 - 2026-10-10
### Fixed
- LinkedIn: Detect the user's profile link from the data export
### Changed
- Upgrade to asimov-linkedin-module 0.4.2

## 0.5.0 - 2026-10-08
### Changed
- Upgrade to asimov-cli 25.7.2 and asimov-sdk 25.7.2
- Replace asimov-social-module by asimov-relay-module 0.1.2

## 0.4.2 - 2026-10-02
### Added
- Optional usage telemetry, disable with `asimov configure telemetry disable`
### Changed
- Upgrade to asimov-cli 25.6.1

## 0.4.1 - 2026-09-25
### Fixed
- Fix LinkedIn module for Intel Macs

## 0.4.0 - 2026-09-21
### Added
- Add experience and education to LinkedIn profiles (#18)
- Expose see-also relationships on profiles (#13)
- Compute common mutuals (#15) (No explicit skill support yet)
- Filter with `asimov list --jev=NOUL` (No explicit skill support yet)
### Changed
- Upgrade to asimov-linkedin-module 0.4.0
- Upgrade to asimov-social-module 0.4.0

## 0.3.0 - 2026-09-16
### Added
- Initial LinkedIn support: connections and basic profiles (#9)
- Support listing and ordering by mutuals (#5)
- Improved install experience on Windows (#16)
### Changed
- Improved skills for `--jq=EXPR` (#10)
- Corrected fetcher behavior for collection resources (#14)
- Upgrade to asimov-social-module 0.3.0

## 0.2.0 - 2026-09-10
### Changed
- Upgrade to asimov-cli 25.5.0 and asimov-social-module 0.1.2

## 0.1.1 - 2026-09-08
### Changed
- Upgrade to asimov-cli 25.4.2 and asimov-social-module 0.1.1
- Add a macOS Intel bundle

## 0.1.0 - 2026-09-07
### Changed
- Upgrade to asimov-cli 25.4.1 and asimov-social-module 0.1.0
- Improve the skill prompts

## 0.0.1 - 2026-09-05
### Added
- Initial test release
