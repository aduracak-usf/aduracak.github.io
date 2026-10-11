# Roomwise

A responsive interior-design planning website created for an individual web interface assignment. It combines room inspiration, a browser-based room-plan CRUD demo, and analytics based on a public furniture-orders dataset.

## Pages

- `index.html` is the interior-design overview.
- `projects.html` demonstrates creating, reading, updating, deleting, and searching room plans. Demo records use browser `localStorage`; there is no backend.
- `analytics.html` uses Chart.js to compare average product, shipping, and assembly costs across room categories, plus order counts.
- `aboutus.html` describes the student project, technologies, GitHub profile, and source repository.

## Data

Analytics use the 1,938 rows in version 1 of [Online Furniture Orders: Delivery & Assembly 2025](https://www.kaggle.com/datasets/pratyushpuri/online-furniture-orders-delivery-and-assembly-2025). The source is synthetic retail data, not interior-design preference research or renovation estimates. Aggregates and methodology are in `data.js`.

## Technology

Static HTML, CSS, and JavaScript; Chart.js 4 for analytics; GitHub Pages for hosting.

## Preview locally

Open `index.html` in a browser, or serve the repository directory with a local web server.

## Live site

https://aduracak-usf.github.io/
