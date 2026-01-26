const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add SQL file support
config.resolver.assetExts.push("sql");
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== "sql",
);

module.exports = config;
