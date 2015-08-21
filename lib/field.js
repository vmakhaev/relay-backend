import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

function contains(lowerName, variants) {
  for (let variant of variants) {
    if (lowerName.indexOf(variant) > -1) return true;
  }
}

function oneOf(lowerName, variants) {
  for (let variant of variants) {
    if (lowerName === variant) return true;
  }
}

export function getFieldType(name, typeString) {
  let type = GraphQLString;

  let lowerName = name.toLowerCase();

  if (contains(lowerName, ['count', 'length', 'number', 'date', 'remaining'])) type = GraphQLInt;
  else if (lowerName.indexOf('has') === 0 || lowerName.indexOf('is') === 0) type = GraphQLBoolean;
  else if (oneOf(lowerName, ['complete', 'completed', 'done', 'finished', 'started'])) type = GraphQLBoolean;

  if (typeString === 'StringValue') type = GraphQLString;
  else if (typeString === 'IntValue') type = GraphQLInt;

  if (name.lastIndexOf('s') === name.length - 1) {
    type = new GraphQLList(type);
  }

  return type;
}
