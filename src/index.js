const HeadlessChrome = require("simple-headless-chrome");
const chromeLauncher = require("chrome-launcher");
const CDP = require("chrome-remote-interface");
const fs = require("fs");
const scrapeRescueTime = require("./rescueTime");
const scrapeAdSense = require("./adSense");
const scrapeAnalytics = require("./analytics");

const config = require("./config/config.json");

const { Chromeless } = require("chromeless");

const browser = new HeadlessChrome({
  headless: true,
  deviceMetrics: {
    width: 1920,
    height: 1080
  }
});

async function scrapeSites() {
  try {
    await browser.init();
    // clear file
    fs.writeFileSync(`${config.outputDir}results.txt`, "");
    await scrapeRescueTime(browser);
    await scrapeAdSense(browser);
    await scrapeAnalytics(browser);
  } catch (err) {
    console.log("ERROR!", err);
  } finally {
    await browser.close();
  }
}

scrapeSites();
