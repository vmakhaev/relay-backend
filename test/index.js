import { getResult, applyMutation } from '../lib';

let names = ['todo'];//, 'starwars', 'treasurehunt'];

for (let name of names) {
  let query = require('./' + name + '/query');
  let { mutation, variables } = require('./' + name + '/mutation');
  console.log('Test: ' + name);
  console.log(query);

  getResult(query)
    .then((result) => {
      console.log(JSON.stringify(result, null, 4));
      applyMutation(mutation, variables)
        .then((res) => {
          console.log(JSON.stringify(res, null, 4));
        })
        .catch((err) => {
          console.error('Error:', err, err.stack);
        });
    })
    .catch((err) => {
      console.error('Error:', err, err.stack);
    });
}
