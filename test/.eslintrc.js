module.exports = {
  extends: '../.eslintrc.js',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    ecmaVersion: 2018,
  },
};
