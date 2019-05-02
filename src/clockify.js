const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");
const { screenshotDOMElement } = require("./common")

module.exports = async function scrapeRescueTime(browser) {
  try {
    const date = moment().subtract(1, "month").format("YYYY-MM");
    const url = `https://www.rescuetime.com/browse/goals/1155502/by/day/for/the/month/of/${date}-1`;
    const page = await browser.newPage();
    page.setViewport({
      width: 1920,
      height: 1080,
    })

    console.log("=== Scraping RescueTime ===");
    // Navigate to a URL
    try {
      await page.goto("https://www.rescuetime.com/login", {waitUntil: 'networkidle0'});
    } catch (error) {
      console.log(`Timeout. ${error.message} Still continuing ...`);
    }

    console.log("Logging in ...");
    await page.type("#email", config.rescueTime.username);
    await page.type("#password", config.rescueTime.password);
    await page.click("button[type=submit]");

    await page.waitFor(2000);
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.waitFor(1000);

    console.log("Saving Screenshot ...");
    await screenshotDOMElement(page, {
      path: `${config.outputDir}rescue-time.png`,
      selector: "#interval_chart",
      padding: '-10 20 -45 5',
    })

    console.log("Getting Productive Hours ...");
    const productiveHoursThisMonth = (await page.evaluate(() => {
      const selectorHtml = document.querySelector(
        "#browse-taxon-duration > h2"
      );
      return selectorHtml.innerHTML;
    }))

    console.log("Writing Productive Hours ...");
    fs.writeFileSync(`${config.outputDir}results.txt`,
      `Productive Hours this month: ${productiveHoursThisMonth}\n`
    );
  } catch (err) {
    console.log("ERROR!", err);
  }
};
