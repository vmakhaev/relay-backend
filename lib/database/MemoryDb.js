import uuid from 'uuid';

export default class MemoryDb {

  constructor() {
    this.collections = {};
  }

  connect() {
    return new Promise((resolve, reject) => resolve());
  }

  destroy() {
    this.collections = null;
  }

  getCollection(collectionName) {
    let collection = this.collections[collectionName];
    if (!collection) collection = this.collections[collectionName] = {};
    return collection;
  }

  getDocById(collectionName, docId) {
    //console.log('getDocById', collectionName, docId);
    return new Promise((resolve, reject) => {
      let collection = this.getCollection(collectionName);
      resolve(collection[docId]);
    });
  }

  getDocsByQuery(collectionName, query = {}) {
    //console.log('getDocsByQuery', collectionName, query);
    return new Promise((resolve, reject) => {
      let collection = this.getCollection(collectionName);

      let docs = Object
        .keys(collection)
        .map((docId) => {
          return collection[docId];
        });
      resolve(docs);
    });
  }

  getCollectionNames() {
    return new Promise((resolve, reject) => {
      resolve(Object.keys(this.collections));
    });
  }

  dropDatabase() {
    return new Promise((resolve, reject) => {
      this.collections = {};
      resolve();
    });
  }

  createDoc(collectionName, doc) {
    //console.log('createDoc', collectionName, doc);
    return new Promise((resolve, reject) => {
      let collection = this.getCollection(collectionName);

      if (!doc.id) doc.id = uuid.v4();

      collection[doc.id] = doc;
      resolve();
    });
  }

  deleteDoc(collectionName, docId) {
    return new Promise((resolve, reject) => {
      let collection = this.getCollection(collectionName);

      delete collection[docId];
      resolve();
    });
  }

  updateDoc(collectionName, docId, data) {
    return new Promise((resolve, reject) => {
      let collection = this.getCollection(collectionName);

      let doc = collection[docId];

      for (let key in data) {
        doc[key] = data[key];
      }
      resolve();
    });
  }
}
