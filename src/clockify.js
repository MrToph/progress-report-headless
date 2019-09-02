const fs = require("fs");
const moment = require("moment");
const devices = require('puppeteer/DeviceDescriptors')
const config = require("./config/config.json");
const { screenshotDOMElement, waitForUrl } = require("./common")

module.exports = async function scrapeRescueTime(browser) {
  try {
    const date = moment().subtract(1, "month").format("YYYY-MM");
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(180 * 1E3)
    page.setViewport({
      width: 1920,
      height: 1080,
    })
    console.table(Object.values(devices).map(a => ({ name: a.name, width: a.viewport.width})))
    await page.emulate(devices['iPad Pro landscape'])

    console.log("=== Scraping Clockify ===");
    // Navigate to a URL
    try {
      await page.goto("https://clockify.me/login", {waitUntil: 'networkidle0'});
    } catch (error) {
      console.log(`Timeout. ${error.message} Still continuing ...`);
    }

    console.log("=== Logging in ===");
    // await page.type("#email", config.rescueTime.username);
    // await page.type("#password", config.rescueTime.password);
    let selector = `button.access__panel__content__buttons--google`
    await page.waitForSelector(selector);
    await page.click(selector);

    console.log("Entering email to Google popup");
    selector = `input[type="email"]`
    await page.waitForSelector(selector);
    await page.type(selector, config.clockify.username);
    await page.waitFor(500);
    await page.keyboard.press('Enter')

    // focusing password input does not help as headless chrome focus has nothing to do with real device focus
    // await page.waitForSelector(`input[name="password"]`) // type=password always exists
    // await page.waitFor(500);
    // await page.type(`input[name="password"]`, ``);
    
    // wait until password entered manually and then redirected to clockify
    console.log("Please enter password to Google popup");

    await waitForUrl(page, /^https:\/\/clockify.me\/tracker/)
    console.log("Redirected to clockify", page.url());
    await page.goto(`https://clockify.me/reports/summary`, {waitUntil: 'networkidle2'});

    console.log("Clicking on Date Range Picker");
    selector = `span[daterangepicker]`
    await page.waitForSelector(selector);
    await page.click(selector);
    
    console.log("Clicking on Last Month");
    selector = `li[data-range-key="Last month"]`
    await page.waitForSelector(selector);
    await page.click(selector);
    
    console.log("Setting client filters");
    selector = `div.client-item > span`
    await page.waitForSelector(selector);
    await page.click(selector);
    await page.waitFor(200)
    const xpaths = await page.$x("//span[contains(., 'self')]");
    if (xpaths.length > 0) {
      await xpaths[0].click();
    } else {
      throw new Error("client filter not found");
    }

    console.log("Closing dropdown");
    selector = `img.dropdown-filter__close-icon`
    await page.waitForSelector(selector);
    await page.click(selector);
    await page.waitFor(500)
    // selector = `div.client-item > span`
    // await page.click(selector);
    
    console.log("Applying filter");
    selector = `button[class^="projects-filter--button"]`
    await page.waitForSelector(selector);
    await page.click(selector);
    
    console.log("Saving Screenshot ...");
    await page.waitFor(1000);
    await screenshotDOMElement(page, {
      path: `${config.outputDir}clockify.png`,
      selector: "canvas",
      padding: '0 0 0 0',
    })

    console.log("Getting Productive Hours ...");
    const productiveHoursThisMonth = (await page.evaluate(() => {
      const selectorHtml = document.querySelector(
        `div.report__total-time`
      );
      return selectorHtml.innerText.replace(/Total:/ig, ``).replace(/\s/g, '');
    }))
    console.log(`Productive Hours:`, productiveHoursThisMonth)

    console.log("Writing Productive Hours ...");
    fs.writeFileSync(`${config.outputDir}results.txt`,
      `Productive Hours this month: ${productiveHoursThisMonth}\n`
    );
  } catch (err) {
    console.log("ERROR!", err);
  }
};
