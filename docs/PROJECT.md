# Project specification and architecture

## Requirements

Inventory manages company computers only. Users can browse all records, search any record field, filter by status, add records, edit existing records, and confirm or cancel deletion. A navigation menu exposes Overview, Computers, and About. About presents three team-member slots for real names and student IDs.

Asset fields: unique asset ID, computer name, brand, assignee, location, status, and optional purchase date. ID, name, brand, and location must contain non-whitespace text. IDs are unique without regard to case. Assigned computers require an assignee. Status must be Available, Assigned, Maintenance, or Retired.

## Visual design

The interface uses a white sidebar, pale green workspace, forest-green actions, summary cards, and a compact inventory table. Status badges include text so meaning does not rely on color. Responsive layouts adapt the navigation and cards for small screens; the table scrolls horizontally. Inputs have labels, actions have accessible names, notices use live status semantics, and delete actions require confirmation.

## Stack

React 19 handles rendering and state. Vite serves and builds the ES module application. Plain CSS defines responsive layouts. Vitest, jsdom, React Testing Library and user-event verify business rules and real user workflows. Google Fonts are optional enhancements with local sans-serif fallbacks.

## Architecture

`index.html` loads `src/main.jsx`, which mounts `App`. `App` owns the in-memory array, navigation, search, filter, editor, confirmation, and feedback state. `AssetForm` owns a draft and validates before passing a sanitized object to App. `src/assets.js` contains sample objects and reusable validation/search functions. `src/style.css` handles presentation. React renders user-entered values as text.

Data flow: user action → controlled form → trimming and validation → immutable state update → refreshed table and statistics. Searching derives a view without mutating data. Asset IDs serve as stable record keys; editing passes the original ID so uniqueness checks permit retaining an existing ID.

## Scope and Part 2

All data is a collection of JavaScript objects. There is no database, authentication, API, or persistent browser storage in Part 1. Changes reset on reload. In Part 2 the students should manually implement an API and database and replace state mutations with API calls, including server-side validation and authorization. Client validation is not a security boundary.

## AI assistance disclosure

Codex generated the requirements interpretation, visual design, React implementation, automated tests, and code review at the user's request. Students should review and understand the code and replace team placeholders before submission.
