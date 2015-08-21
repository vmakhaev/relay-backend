let mutation = 'mutation ChangeTodoStatusMutation($input:ChangeTodoStatusInput!){changeTodoStatus(input:$input){clientMutationId,todo{complete,id},viewer{_todosc94f0551:todos(first:9007199254740991){completedCount},id,todos{completedCount}}}}';
let variables = {
  input: {
    complete: false,
    id: 'VG9kbzpyb290',
    clientMutationId: '0'
  }
};

export default {
  mutation: mutation,
  variables: variables
}
