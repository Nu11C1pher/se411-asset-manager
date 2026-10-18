# Inventory — SE411 Part 1

Computer asset management frontend for Fall 2026–27. Built with React and Vite. The application includes overview and computer inventory pages, search, status filtering, add/edit forms, delete confirmation, and a team About page.

## Run

Requires Node.js 22.12+ or 24 LTS and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm test` runs automated tests; `npm run build` creates `dist/`; `npm run preview` previews that build.

## Assignment checklist

- React frontend with navigation: Overview, Computers, About.
- One asset type: company computers.
- Create, display, update, search, filter, and delete records.
- Data is an array of objects in React state; no database or backend. Reload restores five sample records.
- About page has three explicitly marked name and student ID placeholders. Replace them in `src/App.jsx` before submitting.
- AI-generated requirements/design/architecture, tests, and review are in `docs/` and `src/App.test.jsx`.

## Public GitHub submission

Create an empty **public** GitHub repository named `se411-asset-manager`, then run the following from this project directory (replace YOUR_USERNAME):

```sh
git init
git add .
git commit -m "Build SE411 computer asset manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/se411-asset-manager.git
git push -u origin main
```

Only one team member submits the public repository URL. Do not commit `node_modules` or `dist`. Public publishing must be completed using your GitHub account; local creation alone does not satisfy that requirement.

## Documentation

- [Requirements, design, architecture and technology](docs/PROJECT.md)
- [AI code review](docs/CODE_REVIEW.md)
- [Validation results](docs/TEST_RESULTS.md)

The assignment deadline supplied is **17 October 2026**. The current project creation date is 18 October 2026; confirm late-submission arrangements with your instructor.
