import fs from "fs";

// Ensure plugin file has `.js` extension for dayjs (nếu cần)
const dayjsPath = "./node_modules/dayjs/plugin/timezone";
if (!fs.existsSync(`${dayjsPath}.js`) && fs.existsSync(dayjsPath)) {
  fs.renameSync(dayjsPath, `${dayjsPath}.js`);
}
