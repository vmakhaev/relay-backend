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

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  connectionFromPromisedArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay';

import { getFieldType } from './field';

export function createSchema(types, connections, tree, db) {

  let connectionTypes = {};
  let docTypes = {};

  let { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
      let { type, id } = fromGlobalId(globalId);
      if (type && id) {
        return db.getDocById(type, id);
      }
      return null;
    },
    (obj) => {
      let type = obj.type;
      let schema = docTypes[type]
      if (schema) return schema;
      return null;
    }
  );

  function createConnectionTypes() {
    for (let connectionName in connections) {
      let connection = connections[connectionName];

      let nodeTypeName = connection._nodeType;
      let nodeType = docTypes[nodeTypeName];

      if (!nodeType) {
        throw new Error('No nodeType ' + nodeTypeName + ' for connection ' + connectionName);
      }

      let connectionTypeDefinition = {
        name: nodeTypeName,
        nodeType: nodeType
      };

      let fields = {};

      for (let key in connection) {
        if (key === '_nodeType') continue;

        let fieldType = getFieldType(key);

        fields[key] = {
          type: fieldType,
          resolve: (conn) => conn.edges.length
        }
      }

      connectionTypeDefinition.connectionFields = () => fields;

      let { connectionType, edgeType } = connectionDefinitions(connectionTypeDefinition);
      connectionType._nodeType = nodeTypeName;

      if (connectionTypes[connectionName]) continue;

      connectionTypes[connectionName] = connectionType;
    }
  }

  function createDocTypes() {
    for (let typeName in types) {
      let type = types[typeName];

      let docTypeDefinition = {
        name: typeName,
        fields: {
          id: globalIdField(typeName)
        },
        interfaces: [nodeInterface]
      };

      let ok = true;

      for (let key in type) {
        let field = type[key];
        if (field._connectionType) {
          let connectionType = connectionTypes[field._connectionType];
          if (!connectionType) {
            ok = false;
            break;
          }
          docTypeDefinition.fields[key] = {
            type: connectionType,
            args: connectionArgs,
            resolve: (obj, args) => connectionFromPromisedArray(db.getDocsByQuery(connectionType._nodeType), args)
          }
        } else {
          if (key === 'id') continue;

          let fieldType = getFieldType(key);

          docTypeDefinition.fields[key] = {
            type: fieldType,
            resolve: (obj) => obj[key]
          }
        }
      }

      if (!ok || docTypes[typeName]) continue;

      docTypes[typeName] = new GraphQLObjectType(docTypeDefinition);
    }
  }

  let tries = 10;

  while (tries--) {
    createDocTypes();
    createConnectionTypes();

    if (Object.keys(connectionTypes).length === Object.keys(connections).length &&
      Object.keys(docTypes).length === Object.keys(types).length) {
        break;
      }
  }

  let rootTypeDefinition = {
    name: 'Root',
    fields: {
      node: nodeField
    }
  };

  for (let key in tree) {
    let field = tree[key];
    let typeName = field._type;
    let args = {};
    if (field._arguments) {
      for (let argument of field._arguments) {
        let argumentType = getFieldType(argument.name, argument.type);

        args[argument.name] = {
          type: argumentType
        }
      }
    }

    rootTypeDefinition.fields[key] = {
      type: docTypes[typeName],
      args: args,
      resolve: () => {
        return db.getDocById(field._type, 'root');
      }
    }
  }

  let Root = new GraphQLObjectType(rootTypeDefinition);
  /*
  let Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {},
  });
  */

  return new GraphQLSchema({
    query: Root,
    //mutation: Mutation
  });
}
