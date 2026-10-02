# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.4.2 - 2026-10-02
### Added
- Optional usage telemetry, disabled with `asimov configure telemetry disable`
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
