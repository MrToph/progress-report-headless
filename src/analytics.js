const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");
const { needsGoogleLogin, googleLogin, screenshotDOMElement } = require("./common");

module.exports = async function scrapeAnalytics(browser) {
  try {
    console.log("=== Scraping Google Analytics ===");
    const dateYearMonth = moment().subtract(1, "month").format("YYYYMM");
    const lastDayOfLastMonth = moment().subtract(1, "month").daysInMonth();
    const url = `${config.analytics.url}/%3F_u.date00%3D${dateYearMonth}01%26_u.date01%3D${dateYearMonth}${lastDayOfLastMonth}/`;
    console.log(url);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(180 * 1E3)
    page.setViewport({
      width: 1920,
      height: 1080,
    })
    // Navigate to a URL
    await page.goto(url, {waitUntil: 'networkidle0'});

    if (await needsGoogleLogin(page)) {
      console.log("Logging in ...");
      await googleLogin(page);
      // Wait some time! (2s)
      console.log("Logged in ...");
      await page.waitFor(2000);
    } else {
      console.log("Already logged in ...");
    }
    
    await page.waitForSelector('#galaxyIframe');
    // wait for iframe to load
    await page.waitFor(1000)
    const iframe = await page.frames().find(f => f.name() === 'galaxy');

    console.log("Waiting for Analytics chart ...");
    await iframe.waitForSelector("#ID-overview-graph");
    // wait until the svg animation finishes
    await iframe.waitFor(1000);

    console.log("Saving Screenshot ...");
    await screenshotDOMElement(page, {
      path: `${config.outputDir}website-traffic.png`,
      selector: "#ID-overview-graph",
      padding: `0 0 250 0`,
      frame: iframe,
    })
  } catch (err) {
    console.log("ERROR!", err);
  }
};
