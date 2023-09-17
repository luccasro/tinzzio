module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            screens: './src/screens',
            models: './models',
            services: './src/services',
            navigation: './navigation',
            styles: './styles',
          },
        },
      ],
    ],
  };
};
