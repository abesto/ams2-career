# `ams2-career`

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

Contributing: make a pull request :)
