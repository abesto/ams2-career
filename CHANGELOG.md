# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2022-07-13

### Added

- A new checkbox under Settings to allow regenerating your race options. Especially useful if you get a race for content (DLC) you don't own. ([#11](https://github.com/abesto/ams2-career/issues/11))

### Fixed

- Loading an older save caused a changelog popup to display with changes since the save was downloaded. Cause: "the last version you saw" was stored together with the career save. It's not anymore, so the popups aren't confused anymore. ([#53](https://github.com/abesto/ams2-career/issues/53))

## [1.3.1] - 2022-07-09

### Added

- Added Argentinian Track Pack tracks: Termas Río Hondo, Buenos Aires Circuito (7 layouts), and Córdoba (3 layouts) ([#58](https://github.com/abesto/ams2-career/pull/58))
- Track names now have accents where they should ([#60](https://github.com/abesto/ams2-career/issues/60))
- Some automated tests. Nothing you'll directly see in the app, but it'll help make changes with more confidence (and hopefully, with fewer breakages).
- New, clean data source spreadsheet. Simple automation for synchronizing content from the sheet to the app source code. You also won't notice _this_ directly, but it'll make keeping up with AMS2 content updates easier and less error-prone. ([#58](https://github.com/abesto/ams2-career/pull/58))

## [1.2.1] - 2022-06-12

### Fixed

- When cross-discipline XP gains were disabled, there was no XP gained for races at all ([#54](https://github.com/abesto/ams2-career/issues/54))

## [1.2.0] - 2022-06-11

### Added

- We now request consent for using cookies. Currently the only use is for Google Analytics, which we use to understand how, and how much the app is used.
- Added a Settings page (link in the top bar, next to "Go Race!" and "Career") where you can customize various aspects of your AMS2 Career experience ([#11](https://github.com/abesto/ams2-career/issues/11))
  - Cross-Discipline XP gains can be disabled ([#48](https://github.com/abesto/ams2-career/issues/48))
  - Flat XP multiplier to tweak the length of the career ([#42](https://github.com/abesto/ams2-career/issues/42))
  - Cookie consent can be changed on the Settings page

### Fixed

- Achievements contained an optional function for formatting their current and maximum progress numbers. This was then stored in Redux state, which is not a valid operation. This didn't lead to user-facing bugs (yet), but it did generate warnings in the browser console. Refactored the relevant code to avoid this issue.

## [1.1.0] - 2022-06-08

### Added

- **Progression beyond Grade A**: You can now keep gaining XP after reaching Grade A, until you achieve final mastery of the discipline. Yes, a new achievement is involved! Races previous to this update _do_ count towards the XP gain and achievements; achievements are even awarded retroactively. ([#47](https://github.com/abesto/ams2-career/issues/47))

## [1.0.0] - 2022-06-06

### Added

- We now have a changelog! The app remembers what version was last seen, and only displays new items. Incidentally, this item will not be shown to any users, because the first time a changelog-enabled app version is loaded, we set the latest version as "seen". After all, a changelog makes no sense for a brand-new user in the general case, and the initial rollout is a one-off event.

[1.3.1]: https://github.com/abesto/ams2-career/compare/v1.2.1..v1.3.1
[1.2.1]: https://github.com/abesto/ams2-career/compare/v1.2.0..v1.2.1
[1.2.0]: https://github.com/abesto/ams2-career/compare/v1.1.0..v1.2.0
[1.1.0]: https://github.com/abesto/ams2-career/compare/v1.0.0..v1.1.0
[1.0.0]: https://github.com/abesto/ams2-career/releases/tag/v1.0.0
