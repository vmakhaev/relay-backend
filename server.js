import httpError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { parseBody } from 'express-graphql/dist/parseBody';
import { formatError } from 'graphql/error';
import { getResult, applyMutation } from './lib';

const PORT = 8080;
const pretty = true;

var app = express()
  .use(cookieParser());

app.use(function (req, res, next) {
  let origin = req.get('origin');
  res.header("Access-Control-Allow-Origin", origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  //res.header("Access-Control-Allow-Credential", 'true');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use((req, res, next) => {
  if (req.path === '/favicon.ico') return res.sendStatus(200);
  next();
});

app.use((req, res, next) => {
  if (!req.query.appid) {
    let result = {
      errors: [{
        message: 'Must provide appid in query string. Ex: http://domain.com?appid=yourappid'
      }]
    };

    return res
      .status(400)
      .set('Content-Type', 'text/json')
      .send(JSON.stringify(result, null, pretty ? 2 : 0));
  }
  next();
});

app.use((request, response, next) => {
  let appId = request.query.appid;
  //console.log('appId', appId);

  parseBody(request, (error, data = {}) => {

    // Format any request errors the same as GraphQL errors.
    if (error) {
      return sendError(response, error, pretty);
    }

    // Get GraphQL params from the request and POST body data.
    let { query, variables, operationName } = getGraphQLParams(request, data);

    //console.log(query, variables, operationName);

    if (query.indexOf('query') === 0) {
      getResult(query, appId)
        .then((result) => {
          // Format any encountered errors.
          if (result.errors) {
            result.errors = result.errors.map(formatError);
          }

          // Report 200:Success if a data key exists,
          // Otherwise 400:BadRequest if only errors exist.
          response
            .status(result.hasOwnProperty('data') ? 200 : 400)
            .set('Content-Type', 'text/json')
            .send(JSON.stringify(result, null, pretty ? 2 : 0));
        });
    } else {
      applyMutation(query, variables, appId)
        .then((result) => {
          // Format any encountered errors.
          if (result.errors) {
            result.errors = result.errors.map(formatError);
          }

          // Report 200:Success if a data key exists,
          // Otherwise 400:BadRequest if only errors exist.
          response
            .status(result.hasOwnProperty('data') ? 200 : 400)
            .set('Content-Type', 'text/json')
            .send(JSON.stringify(result, null, pretty ? 2 : 0));
        });
    }
  });
});

app.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`);
});

/**
 * Helper function to get the GraphQL params from the request.
 */
function getGraphQLParams(request: Request, data: Object): GraphQLParams {
  // GraphQL Query string.
  var query = request.query.query || data.query;
  if (!query) {
    throw httpError(400, 'Must provide query string.');
  }

  // Parse the variables if needed.
  var variables = request.query.variables || data.variables;
  if (variables && typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (error) {
      throw httpError(400, 'Variables are invalid JSON.');
    }
  }

  // Name of GraphQL operation to execute.
  var operationName = request.query.operationName || data.operationName;

  return { query, variables, operationName };
}

/**
 * Helper for formatting errors
 */
function sendError(response: Response, error: Error, pretty?: ?boolean): void {
  var errorResponse = { errors: [ formatError(error) ] };
  response
    .status(error.status || 500)
    .set('Content-Type', 'text/json')
    .send(JSON.stringify(errorResponse, null, pretty ? 2 : 0));
}
