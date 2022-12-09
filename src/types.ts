export interface GraphQLType {
  readonly name: string;
  readonly fields: GraphQLField[] | null;
  readonly inputFields: GraphQLInputField[] | null;
}

export interface GraphQLField {
  readonly name: string;
  readonly args: GraphQLInputValue[]
}

export interface GraphQLInputValue {
  readonly name: string;
}

export interface GraphQLInputField {
  readonly name: string;
}
