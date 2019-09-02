const config = require("./config/config.json");

const needsGoogleLogin = async page => {
  return !!(await page.$("#identifierId"))
};

const googleLogin = async page => {
  await page.type("#identifierId", config.google.username);
  await page.click("#identifierNext");
  await page.waitFor(2000); // skip animation
  await page.type("input[name=password]", config.google.password);
  await page.click("#passwordNext");
};

const waitForUrl = async (page, regex) => {
  while(!regex.test(page.url())) {
    await page.waitFor(200)
  }
};

async function screenshotDOMElement(page, opts = {}) {
  const padding = 'padding' in opts ? opts.padding : '0 0 0 0';
  const path = 'path' in opts ? opts.path : null;
  const selector = opts.selector;
  const frame = 'frame' in opts ? opts.frame : page.mainFrame()

  if (!selector)
      throw Error('Please provide a selector.');

  const elementRect = await frame.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element)
          return null;
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
  }, selector);

  let framePosition = { left: 0, top: 0 }
  const parentFrame = frame.parentFrame()
  if (!!parentFrame) {
    framePosition = await parentFrame.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element)
            return null;
        const {x, y, width, height} = element.getBoundingClientRect();
        return {left: x, top: y, width, height, id: element.id};
    }, `iframe[name=${frame.name()}]`);
  }

  if (!elementRect)
      throw Error(`Could not find element that matches selector: ${selector}.`);

  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding.split(' ').map(v => Number.parseInt(v))
  return await page.screenshot({
      path,
      clip: {
          x: framePosition.left + elementRect.left - paddingLeft,
          y: framePosition.top + elementRect.top - paddingTop,
          width: elementRect.width + paddingLeft + paddingRight,
          height: elementRect.height + paddingTop + paddingBottom
      }
  });
}

module.exports = {
  needsGoogleLogin,
  googleLogin,
  screenshotDOMElement,
  waitForUrl,
};
