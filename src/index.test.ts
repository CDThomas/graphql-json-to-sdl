import { test } from "@oclif/test";
import fs from "fs";
import path from "path";

import cmd = require("../src");

// https://github.com/apollographql/apollo-tooling/blob/e8d432654ea840b9d59bf1f22a9bc37cf50cf800/packages/apollo/src/commands/client/__tests__/generate.test.ts

const deleteFolderRecursive = (path: string) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(path);
  }
};

const makeNestedDir = (dir: string) => {
  if (fs.existsSync(dir)) return;

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code === "ENOENT") {
      makeNestedDir(path.dirname(dir)); //create parent dir
      makeNestedDir(dir); //create dir
    }
  }
};

const setupFS = (files: Record<string, string>) => {
  let dir: string | undefined;
  return {
    async run() {
      // make a random temp dir & chdir into it
      dir = fs.mkdtempSync("__tmp__");
      process.chdir(dir);
      // fill the dir with `files`
      Object.keys(files).forEach(key => {
        if (key.includes("/")) makeNestedDir(path.dirname(key));
        fs.writeFileSync(key, files[key]);
      });
    },
    finally() {
      process.chdir("../");
      deleteFolderRecursive(dir as string);
    }
  };
};

// helper function to resolve files from the actual filesystem
const resolveFiles = (opts: { [testPath: string]: string }) => {
  let files: { [testPath: string]: string } = {};
  Object.keys(opts).map(key => {
    files[key] = fs.readFileSync(path.resolve(__dirname, opts[key]), {
      encoding: "utf-8"
    });
  });

  return files;
};

describe("graphql-json-to-sdl", () => {
  test
    .register("fs", setupFS)
    .fs(
      resolveFiles({
        "./schema.json": "../__fixtures__/schema.json"
      })
    )
    .do(() => cmd.run(["./schema.json", "./schema.graphql"]))
    .it("writes a file", () => {
      expect(fs.readFileSync("./schema.graphql").toString()).toMatchSnapshot();
    });
});

describe("given an empty JSON GraphQL schema", () => {
  test
    .register("fs", setupFS)
    .fs({
      "./emptySchema.json": ""
    })
    .stderr()
    .do(() => cmd.run(["./emptySchema.json", "./schema.graphql"]))
    .catch(error =>
      expect(error.message).toMatch(/Schema file .\/emptySchema.json is empty/)
    )
    .it("writes to stderr");

  test
    .register("fs", setupFS)
    .fs({
      "./emptySchema.json": ""
    })
    .stderr()
    .do(() => cmd.run(["./emptySchema.json", "./schema.graphql"]))
    .exit(1)
    .it("exits with a status of 1");
});

/*
  TODO:
  - Test that types/fields in different order in input result in output
    with sorted types and fields.
  - Test other invalid src formats (malformed JSON, etc)
  - Test output errors
*/
