import crypto from 'crypto';
import { graphql } from 'graphql';
import { createSchema } from './schema';
import { getTypes } from './types'
import { MemoryDb, MongoDb } from './database';
import { fillDatabase } from './fake';
import { applyVariableToDb } from './mutation';

let apps = {};
let queryHashMap = {};

export function getResult(query, appId) {
  let { types, connections, tree } = getTypes(query);
  // console.log(JSON.stringify(tree, null, 4));
  // console.log(JSON.stringify(connections, null, 4));
  // console.log(JSON.stringify(types, null, 4));

  let treeString = JSON.stringify(tree);
  let schemaHash = crypto.createHash('md5').update(treeString).digest('hex');

  let app = apps[appId];

  if (app) {
    let { hash, schema } = app;
    if (hash === schemaHash) return graphql(schema, query);
    else {
      // Clean up
      app.db.destroy();
    }
  }

  return new Promise((resolve, reject) => {
    let db = new MemoryDb();
    db
      .connect()
      .then(() => db.dropDatabase())
      .then(() => {
        return fillDatabase(types, db);
      })
      .then(() => {
        let schema = createSchema(types, connections, tree, db);
        apps[appId] = {
          db: db,
          query: query,
          schema: schema,
          types: types,
          connections: connections,
          tree: tree,
          hash: schemaHash
        };

        graphql(schema, query)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
}

export function applyMutation(mutation, variables, appId) {
  let variable = variables.input;

  return new Promise((resolve, reject) => {
    let { db, schema, types } = apps[appId];
    applyVariableToDb(variable, db, mutation, types)
      .then(() => {
        resolve();
        /*
        graphql(schema, mutation, null, variables)
          .then(resolve)
          .catch(reject);
        */
      })
      .catch(reject);
  });
}
