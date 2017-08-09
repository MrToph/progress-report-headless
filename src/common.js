const config = require("./config/config.json");

const needsGoogleLogin = async mainTab => {
  return await mainTab.exist("#identifierId");
};

const googleLogin = async mainTab => {
  await mainTab.fill("#identifierId", config.google.username);
  await mainTab.click("#identifierNext");
  await mainTab.wait(2000); // skip animation
  await mainTab.type("input[name=password]", config.google.password);
  await mainTab.click("#passwordNext");
};

module.exports = {
  needsGoogleLogin,
  googleLogin
};
