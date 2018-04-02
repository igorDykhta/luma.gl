// This file contains webpack configuration settings that allow
// examples to be built against the source code in this repo instead
// of building against their installed version.
//
// This enables using the examples to debug the main library source
// without publishing or npm linking, with conveniences such hot reloading etc.

const {resolve} = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const LIB_DIR = resolve(__dirname, '..');
const SRC_DIR = resolve(LIB_DIR, './src');

// Support for hot reloading changes to the library:
const LOCAL_DEVELOPMENT_CONFIG = {
  mode: 'development',

  devtool: 'source-map',

  // suppress warnings about bundle size
  devServer: {
    stats: {
      warnings: false
    }
  },

  resolve: {
    alias: {
      // Imports the luma.gl library from the src directory in this repo
      'luma.gl': SRC_DIR
    }
  },

  module: {
    rules: [
      {
        // Unfortunately, webpack doesn't import library sourcemaps on its own...
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  }
};

function addLocalDevSettings(config, {libAlias}) {
  config = Object.assign({}, LOCAL_DEVELOPMENT_CONFIG, config);
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  Object.assign(config.resolve.alias, LOCAL_DEVELOPMENT_CONFIG.resolve.alias);
  if (libAlias) {
    config.resolve.alias['luma.gl'] = libAlias;
  }

  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules = config.module.rules.concat(LOCAL_DEVELOPMENT_CONFIG.module.rules);

  return config;
}

function addAnalyzerSettings(config) {
  config.mode = 'production';

  config.resolve = config.resolve || {};
  // 'esnext' picks up luma.gl's ES6 dist for smaller bundles
  config.resolve.mainFields = [
    'esnext', 'browser', 'module', 'main'
  ];

  config.plugins = config.plugins || [];
  config.plugins.push(new BundleAnalyzerPlugin());
  return config;
}

module.exports = (baseConfig, opts = {}) => env => {
  let config = baseConfig;

  if (env && env.analyze) {
    config = addAnalyzerSettings(config);
  }

  if (env && env.local) {
    config = addLocalDevSettings(config, opts);
  }

  // console.warn(JSON.stringify(config, null, 2));
  return config;
};
