# `ams2-career`
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

A simple external career mode for Automobilista 2, built as a web application for desktops and mobile browsers. For the user guide, head to the wiki: https://github.com/abesto/ams2-career/wiki

The rest of this README serves as minimal technical documentation.

## Basic Details

Main libraries / frameworks:

* https://redux-toolkit.js.org/
* https://mui.com/

Points of interest:

- `src/types` defines the data model
- `src/store` contains customizations to the Redux store, including saving / loading into Local Storage, and simple save versioning / migration support.
- `src/app/data` contains static data curated manually in CSV files, and code to access that data
- `src/app/components` contains components used in multiple pages / containers
- `src/app/slices` contains [slices](https://redux-toolkit.js.org/api/createslice) used in multiple pages / containers
- `src/pages` is where most of the UI lives

Local development is super simple:
* `yarn install`
* `yarn start` starts a development server, and tries to open your browser to load it. This has live reloading, error reporting, debugging support, the works.

Contributing: make a pull request :) There are no automated tests, don't even bother looking.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/rsr427"><img src="https://avatars.githubusercontent.com/u/101415774?v=4?s=100" width="100px;" alt=""/><br /><sub><b>rsr427</b></sub></a><br /><a href="#content-rsr427" title="Content">🖋</a> <a href="#data-rsr427" title="Data">🔣</a> <a href="#ideas-rsr427" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://abesto.net"><img src="https://avatars.githubusercontent.com/u/59982?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Zoltán Nagy</b></sub></a><br /><a href="https://github.com/abesto/ams2-career/commits?author=abesto" title="Code">💻</a> <a href="https://github.com/abesto/ams2-career/commits?author=abesto" title="Documentation">📖</a> <a href="#design-abesto" title="Design">🎨</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
