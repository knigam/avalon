// /** @type {import('ts-jest').JestConfigWithTsJest} **/
// export default {
//   testEnvironment: "node",
//   transform: {
//     "^.+.tsx?$": ["ts-jest", {}],
//   },
// };
module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.app.json",
      },
    ],
  },
};
