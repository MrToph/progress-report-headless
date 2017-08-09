const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");
const { needsGoogleLogin, googleLogin } = require("./common");

module.exports = async function scrapeAdSense(browser) {
  try {
    console.log("=== Scraping AdSense ===");
    const date = moment().subtract(1, "month").format("YYYY-MM");
    const url = `https://apps.admob.com/v2/reports/network?d=1&dr=7__&cc=EUR&so=0`; // dr=7__ Last Month
    const mainTab = await browser.newTab({ privateTab: false });

    // Navigate to a URL
    await mainTab.goTo(url);

    if (await needsGoogleLogin(mainTab)) {
      console.log("Logging in ...");
      await googleLogin(mainTab);
    } else {
      console.log("Already logged in ...");
    }

    // Wait some time! (2s)
    await mainTab.wait(2000);
    await mainTab.goTo(url);
    await mainTab.waitForSelectorToLoad(".gwt-viz-container");

    console.log("Saving Screenshot ...");
    await mainTab.wait(2000);
    await mainTab.saveScreenshot(`${config.outputDir}adsense`, {
      selector: ".GKBRQK-B-j"
    });
  } catch (err) {
    console.log("ERROR!", err);
  }
};
