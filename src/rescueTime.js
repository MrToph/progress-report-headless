const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");

module.exports = async function scrapeRescueTime(browser) {
  try {
    console.log("=== Scraping RescueTime ===");
    const date = moment().subtract(1, "month").format("YYYY-MM");
    const url = `https://www.rescuetime.com/browse/goals/1155502/by/day/for/the/month/of/${date}-1`;
    const mainTab = await browser.newTab({ privateTab: false });

    // Navigate to a URL
    await mainTab.goTo("https://www.rescuetime.com/login");

    console.log("Logging in ...");
    await mainTab.fill("#email", config.rescueTime.username);
    await mainTab.fill("#password", config.rescueTime.password);
    await mainTab.click("button[type=submit]");

    // Wait some time! (2s)
    await mainTab.wait(2000);
    await mainTab.goTo(url);

    console.log("Getting Image Viewport ...");
    const clip = await mainTab.getSelectorViewport("#interval_chart");
    clip.width += 10;
    clip.height -= 50;
    // wait until the svg animation finishes
    await mainTab.wait(1000);

    console.log("Saving Screenshot ...");
    await mainTab.saveScreenshot(`${config.outputDir}rescueTime`, {
      clip
    });

    console.log("Getting Productive Hours ...");
    const productiveHoursThisMonth = (await mainTab.evaluate(() => {
      const selectorHtml = document.querySelector(
        "#browse-taxon-duration > h2"
      );
      return selectorHtml.innerHTML;
    })).result.value;

    console.log("Writing Productive Hours ...");
    fs.appendFileSync(
      `${config.outputDir}results.txt`,
      `Productive Hours this month: ${productiveHoursThisMonth}\n`
    );
  } catch (err) {
    console.log("ERROR!", err);
  }
};
