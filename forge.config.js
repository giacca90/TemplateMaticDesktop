module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'favicon.ico'
  },
  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Giacca90',
        description: 'App desktop de rellenado de plantillas',
        setupIcon: 'favicon.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin','win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        iconUrl: 'favicon-linux.png'
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        iconUrl: 'favicon-linux.png'
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
