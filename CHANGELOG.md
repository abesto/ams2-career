# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://semver.org/spec/v2.0.0.html), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added a Settings page (link in the top bar, next to "Go Race!" and "Career") where you can customize various aspects of your AMS2 Career experience ([#11](https://github.com/abesto/ams2-career/issues/11))
  - Cross-Discipline XP gains can be disabled ([#48](https://github.com/abesto/ams2-career/issues/48))
  - Flat XP multiplier to tweak the length of the career ([#42](https://github.com/abesto/ams2-career/issues/42))

### Fixed

- Achievements contained an optional function for formatting their current and maximum progress numbers. This was then stored in Redux state, which is not a valid operation. This didn't lead to user-facing bugs (yet), but it did generate warnings in the browser console. Refactored the relevant code to avoid this issue.

## [1.1.0] - 2022-06-08

### Added

- **Progression beyond Grade A**: You can now keep gaining XP after reaching Grade A, until you achieve final mastery of the discipline. Yes, a new achievement is involved! Races previous to this update _do_ count towards the XP gain and achievements; achievements are even awarded retroactively. ([#47](https://github.com/abesto/ams2-career/issues/47))

## [1.0.0] - 2022-06-06

### Added

- We now have a changelog! The app remembers what version was last seen, and only displays new items. Incidentally, this item will not be shown to any users, because the first time a changelog-enabled app version is loaded, we set the latest version as "seen". After all, a changelog makes no sense for a brand-new user in the general case, and the initial rollout is a one-off event.

[1.1.0]: https://github.com/abesto/ams2-career/compare/v1.0.0..v1.1.0
[1.0.0]: https://github.com/abesto/ams2-career/releases/tag/v1.0.0
