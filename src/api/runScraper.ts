import scrapeArmor from "./armor";
import scrapeBackpacks from "./backpacks";
import scrapeGuns from "./guns";
import scrapeHelmets from "./helmets";
import scrapeRigs from "./rigs";

async function runAllScrapers() {
  console.log("Running all scrapers manually...");
  await scrapeArmor();
  await scrapeBackpacks();
  await scrapeGuns();
  await scrapeHelmets();
  await scrapeRigs();
  console.log("All scrapers executed successfully.");
}

runAllScrapers();
