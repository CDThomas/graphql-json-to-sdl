import fs from "fs";
import { Command } from "@oclif/command";
import { buildClientSchema, printSchema } from "graphql";

interface GraphQLType {
  readonly name: string | null;
  readonly fields: GraphQLField[] | null;
}

interface GraphQLField {
  readonly name: string;
}

class GraphqlJsonToSdl extends Command {
  static description = "describe the command here";

  static args = [
    { name: "src", required: true },
    { name: "out", required: true }
  ];

  async run() {
    const { args } = this.parse(GraphqlJsonToSdl);
    const { src, out } = args;

    writeSchema(src, out);
  }
}

function writeSchema(src: string, out: string) {
  const fileContent = fs.readFileSync(src, "utf-8");

  if (!fileContent) {
    throw new Error("no schema found");
    return;
  }

  const { data } = JSON.parse(fileContent);

  data.__schema.types.sort((a: GraphQLType, b: GraphQLType) => {
    if (!a.name || !b.name) {
      return compareUnnamedTypes(a, b);
    }

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

function compareUnnamedTypes(a: GraphQLType, b: GraphQLType): number {
  if (!isNamedType(a) && isNamedType(b)) return -1;
  if (isNamedType(a) && !isNamedType(b)) return 1;
  return 0;
}

function isNamedType(type: GraphQLType): boolean {
  return !!type.name;
}

export = GraphqlJsonToSdl;
