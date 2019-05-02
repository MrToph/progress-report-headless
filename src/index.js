const puppeteer = require('puppeteer');
const fs = require("fs");
const scrapeTimelog = require("./clockify");
const scrapeAdSense = require("./adSense");
const scrapeAnalytics = require("./analytics");

const config = require("./config/config.json");

const mkdirSync = function(dirPath) {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

async function scrapeSites() {
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
  });
  try {
    // clear file
    mkdirSync(config.outputDir);
    // await scrapeAdSense(browser);
    // await scrapeTimelog(browser);
    await scrapeAnalytics(browser);
  } catch (err) {
    console.log("ERROR!", err);
  } finally {
    browser.close();
  }
}

scrapeSites();
