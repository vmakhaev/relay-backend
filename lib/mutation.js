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

const mutationNameRegex = /^mutation ([a-zA-Z]*)/;

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getMutationName(mutation) {
  let results = mutationNameRegex.exec(mutation);
  return results[0];
}

function guessCollectionNameByDb(db, mutation) {
  let mutationName = getMutationName(mutation);
  let lowerMutationName = mutationName.toLowerCase();

  return new Promise((resolve, reject) => {
    db
      .getCollectionNames()
      .then((collectionNames) => {
        for (let collectionName of collectionNames) {
          if (lowerMutationName.indexOf(collectionName.toLowerCase()) > -1) {
            return resolve(collectionName);
          }
        }

        // TODO: can we do anything better?
        resolve(collectionNames[0]);
      })
      .catch(reject);
  });
}

function guessCollectionNameByTypes(types, variable) {
  let fields = Object.keys(variable);
  let fitNames = [];

  for (let typeName in types) {
    let type = types[typeName];
    let fit = true;
    for (let field of fields) {
      if (!type[field]) {
        fit = false;
        break;
      }
    }
    if (fit) fitNames.push(typeName);
  }

  if (fitNames.length === 1) return fitNames[0];
}

function createDoc(variable, db, mutation, types) {
  return new Promise((resolve, reject) => {
    let collectionName = guessCollectionNameByTypes(types, variable);
    if (collectionName) {
      return db.createDoc(collectionName, variable);
    } else {
      guessCollectionNameByDb(db, mutation)
        .then((typeName) => {
          db.createDoc(typeName, variable)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    }
  })
}

export function applyVariableToDb(variable, db, mutation, types) {
  delete variable.clientMutationId;

  if (!Object.keys(variable).length) {
    // TODO: unsupported mutations
    return new Promise((resolve) => resolve());
  }

  if (!variable.id) {
    return createDoc(variable, db, mutation, types);
  } else {
    let { type, id } = fromGlobalId(variable.id);

    let data = clone(variable);
    delete data.id;

    if (Object.keys(data).length) {
      return db.updateDoc(type, id, data);
    } else {
      return db.deleteDoc(type, id);
    }
  }
}
