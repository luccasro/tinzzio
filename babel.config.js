module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            screens: './src/screens',
            models: './src/models',
            context: './src/context',
            services: './src/services',
            navigation: './navigation',
            styles: './src/styles',
          },
        },
      ],
    ],
  };
};
