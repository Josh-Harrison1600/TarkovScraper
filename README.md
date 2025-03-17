Tarkov Scraper is my backend for my Tarkov Randomizer project. This project uses web scraping with Node.js/Cheerio to sort through each category of the Escape From Tarkov wiki and store them in a AWS MySQL database.

The database is hosted using an HTTP API via AWS and is sent to the frontend.

Only GET requests can be made on the API with the addition of rate limiting to prevent any form of API abuse.

This scraper is additionally set to run once a month automatically with Github Actions to account for any new additions or updates in the game!
