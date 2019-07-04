import { test } from "@oclif/test";
import fs from "fs";
import path from "path";

import cmd = require("../src");

import { GraphQLType } from "./types";

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

describe("graphql-json-to-sdl given a valid GraphQL schema as JSON", () => {
  test
    .register("fs", setupFS)
    .fs(
      resolveFiles({
        "./schema.json": "../__fixtures__/schema.json"
      })
    )
    .do(() => cmd.run(["./schema.json", "./schema.graphql"]))
    .it("writes the GraphQL schema in SDL to a file", () => {
      expect(fs.readFileSync("./schema.graphql").toString()).toMatchSnapshot();
    });
});

describe("graphql-json-to-sdl given schemas with the same types and fields in a different order", () => {
  const schema = fs.readFileSync(
    path.resolve(__dirname, "../__fixtures__/schema.json"),
    "utf-8"
  );

  const { data } = JSON.parse(schema);
  data.__schema.types.reverse();
  data.__schema.types.forEach((type: GraphQLType) => {
    if (!type.fields) return;
    type.fields.reverse();
  });
  const reversedSchema = JSON.stringify({ data });

  test
    .register("fs", setupFS)
    .fs({
      "./schema.json": schema,
      "./reversedSchema.json": reversedSchema
    })
    .do(() => cmd.run(["./schema.json", "./schemaOne.graphql"]))
    .do(() => cmd.run(["./reversedSchema.json", "./schemaTwo.graphql"]))
    .it("produces the same output", () => {
      const schemaOne = fs.readFileSync("./schemaOne.graphql").toString();
      const schemaTwo = fs.readFileSync("./schemaTwo.graphql").toString();

      expect(schemaOne).toBeTruthy();
      expect(schemaTwo).toBeTruthy();
      expect(schemaOne).toBe(schemaTwo);
    });
});

describe("graphql-json-to-sdl given no arguments", () => {
  test
    .do(() => cmd.run([]))
    .catch(error => expect(error.message).toMatch(/Missing 2 required args/))
    .it("writes to stderr");

  test
    .do(() => cmd.run([]))
    .exit(2)
    .it("exits with a status of 2");
});

describe("graphql-json-to-sdl given one argument", () => {
  test
    .do(() => cmd.run(["./schema.json"]))
    .catch(error => expect(error.message).toMatch(/Missing 1 required arg/))
    .it("writes to stderr");

  test
    .do(() => cmd.run([]))
    .exit(2)
    .it("exits with a status of 2");
});

describe("graphql-json-to-sdl given an empty JSON GraphQL schema", () => {
  test
    .register("fs", setupFS)
    .fs({
      "./emptySchema.json": ""
    })
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
    .do(() => cmd.run(["./emptySchema.json", "./schema.graphql"]))
    .exit(1)
    .it("exits with a status of 1");
});

describe("graphql-json-to-sdl given a file that doesn't exist", () => {
  test
    .do(() => cmd.run(["./missingSchema.json", "./schema.graphql"]))
    .catch(error =>
      expect(error.message).toMatch(
        /ENOENT: no such file or directory, open '.\/missingSchema.json'/
      )
    )
    .it("writes to stderr");

  test
    .do(() => cmd.run(["./missingSchema.json", "./schema.graphql"]))
    .exit(1)
    .it("exits with a status of 1");
});
