const HeadlessChrome = require("simple-headless-chrome");
const fs = require("fs");
const scrapeRescueTime = require("./rescueTime");
const scrapeAdSense = require("./adSense");
const scrapeAnalytics = require("./analytics");

const config = require("./config/config.json");

const browser = new HeadlessChrome({
  headless: false,
  deviceMetrics: {
    width: 1920,
    height: 1080
  },
  browser: {
    loadPageTimeout: 60 * 60 * 1000,
    loadSelectorTimeout: 60000
  }
});

const mkdirSync = function(dirPath) {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

async function scrapeSites() {
  try {
    await browser.init();
    // clear file
    mkdirSync(config.outputDir);
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
