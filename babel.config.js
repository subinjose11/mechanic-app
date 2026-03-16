module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@models': './src/models',
            '@controllers': './src/controllers',
            '@stores': './src/stores',
            '@firebaseServices': './src/firebase',
            '@views': './src/views',
            '@domain': './src/domain',
            '@data': './src/data',
            '@presentation': './src/presentation',
            '@core': './src/core',
            '@services': './src/services',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
