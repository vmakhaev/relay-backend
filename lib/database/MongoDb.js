import { MongoClient } from 'mongodb';
import uuid from 'uuid';

let mongoUrl = 'mongodb://localhost:27017/relay-backend';

export default class MongoDb {

  connect(url) {
    return new Promise((resolve, reject) => {
      if (!url) url = mongoUrl;
      MongoClient.connect(url, (err, db) => {
        if (err) {
          console.error('Mongo error:', err);
          reject(err);
        } else {
          this.db = db;
          console.log('Connected to mongodb')
          resolve();
        }
      });
    });
  }

  destroy() {
    this.dropDatabase()
      .then(() => {
        this.db.close();
      });
  }

  getDocById(collectionName, docId) {
    return new Promise((resolve, reject) => {
      this.db
        .collection(collectionName)
        .findOne({_id: docId}, (err, doc) => {
          if (err) reject(err);
          else resolve(doc);
        });
    });
  }

  getDocsByQuery(collectionName, query = {}) {
    return new Promise((resolve, reject) => {
      this.db
        .collection(collectionName)
        .find(query)
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        });
    });
  }

  getCollectionNames() {
    return new Promise((resolve, reject) => {
      this.db
        .listCollections()
        .toArray((err, collections) => {
          if (err) reject(err);
          else {
            // TODO: filter sessions collection?
            let collectionNames = collections
              .map((collection) => collection.name)
              .filter((collectionName) => collectionName.indexOf('system.') === -1);
            resolve(collectionNames);
          }
        });
    });
  }

  dropDatabase() {
    return new Promise((resolve, reject) => {
      this.db
        .dropDatabase((err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
    })
  }

  createDoc(collectionName, doc) {
    return new Promise((resolve, reject) => {
      if (!doc.id) doc.id = uuid.v4();
      if (!doc._id) doc._id = doc.id;

      this.db
        .collection(collectionName)
        .insertOne(doc, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
    });
  }

  deleteDoc(collectionName, docId) {
    return new Promise((resolve, reject) => {
      this.db
        .collection(collectionName)
        .deleteOne({_id: docId}, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
    });
  }

  updateDoc(collectionName, docId, data) {
    return new Promise((resolve, reject) => {
      this.db
        .collection(collectionName)
        .updateOne({_id: docId}, {$set: data}, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
    });
  }
}
