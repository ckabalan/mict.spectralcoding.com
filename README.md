# Melvor Idle Completionist Tool

The Melvor Idle Completionist Tool (MICT) accepts a user's Melvor Idle Save Data Export and displays the remaining items, pets, and monsters needed to complete the game.

## Project Structure

### Branching

This repository is has three main branches:

- `main` - Live site content
- `develop` - Non-published content in development
- `tooling` - Development tools used to export data from the Melvor Idle game code

### Static Website

The `main` and `develop` branches contain the main static HTML/CSS/JavaScript website which accepts Melvor Idle save data and presents the missing items/pets/monsters tables. The entirety of the user-facing website is client side code.

The `data/` directory contains a static data exported from the Mevlor Idle game code (see the `tooling` branch, and below). This data is meant to be re-generated whenever new game data is released.

The `js/main.js` file contains the majority of the processing logic, handling loading of the save data, page appearance, and generation of the missing items/pets/monsters tables.

### Data Export Tooling

The `tooling` branch contains tooling to extract game data from the Melvor Idle code and generates a JavaScript source code file to be placed at `data/melvordata.js` in the `develop` and `main` branches. This functionality could be included as part of the main site but concerns about loading too much game code directly into the MICT site lead me to split this off into a data extraction tool.

Opening the `index.html` will load live Melvor Idle code files into the page, extract data from the pages, and present the resulting JavaScript file in a textarea for copying into `melvordata.js`.

The general process for importing a new data set from Melvor Idle would be to identify the data in the game source, update `index.html` and `js/main.js` in the `tooling` branch to reference the Melvor Idle game data adding it to the export object. That object is then manually copied to the site branches where it can be referenced.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

All Melvor Idle assets and code are property of [Melvor Idle](https://melvoridle.com) and Malcs.

Checklist icon made by [Freepik](https://www.flaticon.com/authors/freepik) from [Flaticon](https://www.flaticon.com/)

## License

Melvor Idle Completionist Tool is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Melvor Idle Completionist Tool is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Melvor Idle Completionist Tool.  If not, see <http://www.gnu.org/licenses/>.
