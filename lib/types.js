import { graphql } from 'graphql';
import { Source } from 'graphql/language/source';
import { parse } from 'graphql/language/parser';
import { ValidationContext } from 'graphql/validation/validate';

export function getTypes(query) {
  let source = new Source(query);
  let documentAST = parse(source);
  let context = new ValidationContext(null, documentAST, null);

  function parseDefinition(obj, definition) {
    if (definition.selectionSet) {
      for (let selection of definition.selectionSet.selections) {

        if (selection.kind === 'Field') {
          let field = obj[selection.name.value];
          if (!field) {
            field = obj[selection.name.value] = {};
          }

          if (selection.alias) {
            field._alias = selection.alias.value;
          }

          if (selection.arguments.length) {
            field._arguments = selection.arguments.map((a) => {
              return {
                name: a.name.value,
                value: a.value.value,
                type: a.value.kind
              };
            });
          }
          parseDefinition(field, selection);

        } else if (selection.kind === 'FragmentSpread') {
          let fragment = context.getFragment(selection.name.value);

          if (fragment.typeCondition) {
            obj._type = fragment.typeCondition.name.value;
          }
          parseDefinition(obj, fragment);
        }

      }
    }
  }

  // TODO: is root always first one?
  let root = documentAST.definitions[0];

  let tree = {};

  parseDefinition(tree, root);

  let connections = {};
  let types = {};
  let connectionIndex = 0

  function getConnectionName() {
    return 'Connection' + connectionIndex++;
  }

  function parseType(obj, typeName, typeKey) {
    if (obj._type || obj.edges) {
      let type;
      let connectionName;
      if (obj.edges) {
        connectionName = obj._type || getConnectionName();
        type = connections[connectionName];
        if (!type) type = connections[connectionName] = {};
      } else {
        type = types[obj._type];
        if (!type) type = types[obj._type] = {};
      }

      for (let key in obj) {
        if (key[0] === '_') continue;

        if (key === 'pageInfo') {
          continue;
        }

        if (key === 'edges') {
          let nodeType = obj[key].node._type;
          type._nodeType = nodeType;
          if (typeName && typeKey) {
            types[typeName][typeKey]._connectionType = connectionName;
          }
          parseType(obj[key].node);
          continue;
        }

        let field = type[key];
        if (!field) {
          field = type[key] = {};
        }

        parseType(obj[key], obj._type, key);
      }
    } else {
      for (let key in obj) {
        if (key[0] === '_') continue;

        parseType(obj[key]);
      }
    }
  }

  parseType(tree);

  return {
    connections: connections,
    types: types,
    tree: tree
  }
}
