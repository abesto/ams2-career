# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2026-07-12

### Added

- Added canonical Automobilista 2 car and track data explorers plus a compatibility matrix.

### Changed

- Refreshed imported game metadata, class mappings, track labels, and legacy save aliases.
- AI-only vehicles, including safety cars and aero variants, are no longer selectable.
- Improved car/track compatibility handling for kart, rallycross, oval, and point-to-point layouts.

### Fixed

- Older saves with retired cars, tracks, classes, or race offers no longer crash the app.
- Historical logbook entries remain visible when their original car is no longer selectable.

## [1.7.0] - 2026-07-11

### Changed

- Refreshed the app's overall look and feel with clearer spacing, improved visual hierarchy, and a more polished layout while keeping the same core structure and workflows.
- Updated the main racing screen to make race selection, simulator settings, AI adjustments, and result entry easier to scan, especially on larger screens.
- Restyled the career, settings, and debugger pages so related information is grouped more clearly and important controls are easier to pick out at a glance.
- Improved dialogs and popups, including race outcome summaries, onboarding, and cookie consent, so they better match the rest of the app.

## [1.6.0] - 2026-07-11

### Changed

- This release updates a large amount of the app's underlying code and libraries. You should not notice major changes to how the app works day to day, but this work makes future updates easier, keeps the app compatible with current browsers, and reduces the risk of breakage as dependencies age.
- The app now runs on a more modern foundation overall, including the parts responsible for rendering the interface, navigation, saving/loading data, and development-time checks. In practice, this is mostly a maintenance and stability release.

### Fixed

- Older save files that are missing some metadata now load correctly instead of failing with an error.
- The Cars/Tracks debugger no longer crashes when a track is missing configuration details.
- Some toolbar actions no longer trigger a browser error caused by button rendering.

## [1.5.0] - 2022-12-09

### Added

- A new Position XP Multiplier under Settings. This option controls how heavily your finishing position influences the amount of XP points earned. `1.0` is the default; lower values mean your race results matter less. At `0.0`, you'll get the same amount of XP for finishing a race, no matter your result. Conversely, at very high values you get a LOT of XP for winning, and possibly none at all for poor results. ([#65](https://github.com/abesto/ams2-career/issues/65))

### Security

- Upgraded `terser` dependency to get security fixes ([alert](https://github.com/abesto/ams2-career/security/dependabot/16), [#61](https://github.com/abesto/ams2-career/pull/61))
- Upgraded `loader-utils` dependency to get security fixes ([alerts](https://github.com/abesto/ams2-career/security/dependabot?q=package%3Aloader-utils+manifest%3Ayarn.lock+has%3Apatch), [#64](https://github.com/abesto/ams2-career/pull/64))
- Upgraded `decode-uri-component` dependency to get security fixes ([alert](https://github.com/abesto/ams2-career/security/dependabot/23), [#66](https://github.com/abesto/ams2-career/pull/66))

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

[1.8.0]: https://github.com/abesto/ams2-career/compare/v1.7.0..v1.8.0
[1.7.0]: https://github.com/abesto/ams2-career/compare/v1.6.0..v1.7.0
[1.6.0]: https://github.com/abesto/ams2-career/compare/v1.5.0..v1.6.0
[1.5.0]: https://github.com/abesto/ams2-career/compare/v1.4.1..v1.5.0
[1.4.1]: https://github.com/abesto/ams2-career/compare/v1.3.1..v1.4.1
[1.3.1]: https://github.com/abesto/ams2-career/compare/v1.2.1..v1.3.1
[1.2.1]: https://github.com/abesto/ams2-career/compare/v1.2.0..v1.2.1
[1.2.0]: https://github.com/abesto/ams2-career/compare/v1.1.0..v1.2.0
[1.1.0]: https://github.com/abesto/ams2-career/compare/v1.0.0..v1.1.0
[1.0.0]: https://github.com/abesto/ams2-career/releases/tag/v1.0.0
[Unreleased]: https://github.com/abesto/ams2-career/compare/v1.8.0..HEAD
