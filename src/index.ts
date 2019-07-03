import { Command, flags } from "@oclif/command";
import fs from "fs";
import { buildClientSchema, printSchema } from "graphql";

interface GraphQLType {
  readonly name: string;
  readonly fields: GraphQLField[] | null;
}

interface GraphQLField {
  readonly name: string;
}

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
    }
  }
}

class EmptySchemaError extends Error {}

function writeSchema(src: string, out: string) {
  const fileContent = fs.readFileSync(src, "utf-8");

  if (!fileContent) {
    throw new EmptySchemaError();
  }

  const { data } = JSON.parse(fileContent);

  data.__schema.types.sort((a: GraphQLType, b: GraphQLType) => {
    return a.name.localeCompare(b.name);
  });

  data.__schema.types.forEach((type: GraphQLType) => {
    if (!type.fields) return;

    type.fields.sort((a: GraphQLField, b: GraphQLField) => {
      return a.name.localeCompare(b.name);
    });
  });

  const clientSchema = buildClientSchema(data);

  const graphqlSchemaString = printSchema(clientSchema);

  fs.writeFileSync(out, graphqlSchemaString);
}

export = GraphqlJsonToSdl;
