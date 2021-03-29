const path = require('path');

const CracoAntDesignPlugin = require('craco-antd');

module.exports = {
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: { customizeThemeLessPath: path.join(__dirname, 'src/antd.customize.less') },
    },
  ],
};
