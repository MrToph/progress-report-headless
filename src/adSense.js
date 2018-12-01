const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");
const { needsGoogleLogin, googleLogin, screenshotDOMElement } = require("./common");

module.exports = async function scrapeAdSense(browser) {
  try {
    console.log("=== Scraping AdSense ===");
    const date = moment().subtract(1, "month").format("YYYY-MM");
    const url = `https://apps.admob.com/v2/reports/LTMxNjEwNjU0MzI4MDU5NzQwMTQ/view`;
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
      await page.waitFor(2000);
      await page.goto(url, {waitUntil: 'networkidle0'});
    } else {
      console.log("Already logged in ...");
    }

    console.log('Waiting for graph to load ...')
    await page.waitForSelector(".report-content");
    // wait for animation to finish
    await page.waitFor(2000);

    console.log("Saving Screenshot ...");
    await screenshotDOMElement(page, {
      path: `${config.outputDir}admob-income.png`,
      selector: ".report-content",
      padding: `0 -50 0 -50`
    })
  } catch (err) {
    console.log("ERROR!", err);
  }
};
