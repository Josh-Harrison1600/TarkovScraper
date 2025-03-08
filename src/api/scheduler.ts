import cron from 'node-cron';
import scrapeArmor from './armor';
import scrapeBackpacks from './backpacks';
import scrapeGuns from './guns';
import scrapeHelmets from './helmets';
import scrapeRigs from './rigs';

// Scheduled to run once a month, Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
const today = new Date();
    if(today.getDate() <= 7){
        console.log("Running Monthly Tarkov Wiki Scraper...");
        await scrapeArmor();
        await scrapeBackpacks();
        await scrapeGuns();
        await scrapeHelmets();
        await scrapeRigs();
        console.log("Scraping complete!");
}
});

