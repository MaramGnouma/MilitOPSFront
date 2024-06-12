module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  collectCoverage: true,
  coverageReporters: ['html'],
};
