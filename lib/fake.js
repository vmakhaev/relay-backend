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

import faker from 'faker';
import Sentencer from 'sentencer';
import uuid from 'uuid';
import { getFieldType } from './field';

const fakerFields = [
  'address',
  'commerce',
  'company',
  //'date',
  'finance',
  'hacker',
  //'helpers',
  //'image',
  'internet',
  //'lorem',
  'name',
  'phone',
  //'random'
]

function randomBetween(from, to) {
  return Math.floor(Math.random() * (to - from)) + from;
}

export function fillDatabase(types, db) {
  return new Promise((resolve, reject) => {
    let promises = [];
    for (let typeName in types) {
      let type = types[typeName];
      let count = randomBetween(5, 15);
      for (let i = 0; i < count; i++) {
        let doc = createFakeDocFromType(type);

        // TODO: handle root in other way
        if (i === 0) doc.id = 'root';

        promises.push(db.createDoc(typeName, doc));
      }
    }
    Promise
      .all(promises)
      .then(resolve)
      .catch(reject);
  });
}

function createFakeDocFromType(type) {
  let doc = {};

  for (let key in type) {
    if (key === 'id') {
      doc[key] = uuid.v4();
      continue;
    }

    if (type[key]._connectionType) {
      // TODO: array of ids
      continue;
    }

    if (key.toLowerCase().indexOf('email') > -1) {
      doc[key] = faker.internet.email();
      continue;
    }

    if (key.toLowerCase().indexOf('phone') > -1) {
      doc[key] = faker.phone.phoneNumber();
      continue;
    }

    if (key.toLowerCase().indexOf('image') > -1) {
      doc[key] = faker.image.image();
      continue;
    }

    if (key.toLowerCase().indexOf('avatar') > -1) {
      doc[key] = faker.image.avatar();
      continue;
    }

    if (key.toLowerCase().indexOf('username') > -1) {
      doc[key] = faker.internet.userName();
      continue;
    }

    if (key.toLowerCase().indexOf('price') > -1) {
      doc[key] = faker.commerce.price();
      continue;
    }

    for (let fakerField of fakerFields) {
      let fakerGroup = faker[fakerField];
      for (let fakerKey in fakerGroup) {
        if (fakerKey === key) {
          doc[key] = fakerGroup[fakerKey]();
          break;
        }
      }
    }

    if (!doc[key]) {
      let fieldType = getFieldType(key);
      switch (fieldType) {
        case GraphQLBoolean:
          doc[key] = faker.random.boolean();
          break;
        case GraphQLInt:
          doc[key] = faker.random.number();
          break;
        case GraphQLString:
          //doc[key] = faker.lorem.sentence();
          let sentence = Sentencer.make("{{ adjective }} {{ noun }} and {{ adjective }} {{ noun }}.");
          doc[key] = sentence[0].toUpperCase() + sentence.slice(1);
          break;
      }
    }
  }

  return doc;
}
