import { Config } from "jest";

export default {
  coverageDirectory: ".coverage",
  coveragePathIgnorePatterns: [".mock.(ts|tsx)$"],
  collectCoverage: true,
  preset: "ts-jest",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
} satisfies Config;
