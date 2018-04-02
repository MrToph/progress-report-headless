const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");
const { needsGoogleLogin, googleLogin } = require("./common");

module.exports = async function scrapeAnalytics(browser) {
  try {
    console.log("=== Scraping Google Analytics ===");
    const dateYearMonth = moment().subtract(1, "month").format("YYYYMM");
    const lastDayOfLastMonth = moment().subtract(1, "month").daysInMonth();
    const url = `${config.analytics.url}/%3F_u.date00%3D${dateYearMonth}01%26_u.date01%3D${dateYearMonth}${lastDayOfLastMonth}/`;
    const mainTab = await browser.newTab({ privateTab: false });
    console.log(url);
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
    await mainTab.waitForSelectorToLoad("#ID-overview-graph");
    await mainTab.wait(1000);

    console.log("Getting Image Viewport ...");
    const graphClip = await mainTab.getSelectorViewport("#ID-overview-graph");
    const infoClip = await mainTab.getSelectorViewport(
      "#ID-overview-graph + table"
    );
    const clip = {
      x: graphClip.x,
      y: graphClip.y,
      width: graphClip.width,
      height: graphClip.height + 10 + infoClip.height,
      scale: graphClip.scale
    };
    console.log(clip);
    // wait until the svg animation finishes
    await mainTab.wait(1000);

    console.log("Saving Screenshot ...");
    await mainTab.saveScreenshot(`${config.outputDir}website-traffic`, {
      clip
    });
  } catch (err) {
    console.log("ERROR!", err);
  }
};
