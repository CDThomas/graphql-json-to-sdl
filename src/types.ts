export interface GraphQLType {
  readonly name: string;
  readonly fields: GraphQLField[] | null;
}

export interface GraphQLField {
  readonly name: string;
  readonly args: GraphQLInputValue[]
}

export interface GraphQLInputValue {
  readonly name: string;
}
