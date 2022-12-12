import { Command, flags } from "@oclif/command";
import fs from "fs";
import { buildClientSchema, printSchema } from "graphql";

import { GraphQLField, GraphQLType } from "./types";

class GraphqlJsonToSdl extends Command {
  static description = "Converts a JSON GraphQL schema to GraphQL SDL.";

  static examples = ["$ graphql-json-to-sdl ./schema.json ./schema.graphql"];

  static args = [
    {
      name: "src",
      required: true,
      description: "The JSON GraphQL schema to convert."
    },
    { name: "out", required: true, description: "The output file." }
  ];

  static flags = {
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" })
  };

  async run() {
    const { args } = this.parse(GraphqlJsonToSdl);
    const { src, out } = args;

    try {
      writeSchema(src, out);
    } catch (error) {
      if (error instanceof EmptySchemaError) {
        this.error(
          `Schema file ${src} is empty. Please provide a valid JSON schema.`,
          { exit: 1 }
        );
      }

      this.error(error, { exit: 1 });
    }
  }
}

class EmptySchemaError extends Error { }

function writeSchema(src: string, out: string) {
  const fileContent = fs.readFileSync(src, "utf-8");

  if (!fileContent) {
    throw new EmptySchemaError();
  }

  const { data } = JSON.parse(fileContent);

  sortByName(data.__schema.types);

  data.__schema.types.forEach((type: GraphQLType) => {
    if (type.fields) {
      sortByName(type.fields);

      type.fields.forEach((field: GraphQLField) => {
        sortByName(field.args);
      });
    }

    if (type.inputFields) {
      sortByName(type.inputFields);
    }
  });

  const clientSchema = buildClientSchema(data);

  const graphqlSchemaString = printSchema(clientSchema);

  fs.writeFileSync(out, graphqlSchemaString);
}

function sortByName<T extends { name: string }>(items: T[]) {
  items.sort((a: T, b: T) => a.name.localeCompare(b.name));
}

export = GraphqlJsonToSdl;
