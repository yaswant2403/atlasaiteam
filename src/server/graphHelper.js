require('isomorphic-fetch');
const azure = require('@azure/identity');
const graph = require('@microsoft/microsoft-graph-client');
const authProviders = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

let _settings = undefined;
let _clientSecretCredential = undefined;
let _appClient = undefined;

function initializeGraphAuth() {
    const settings = {
        'clientId': process.env.CLIENT_ID,
        'tenantId': process.env.TENANT_ID,
        'clientSecret': process.env.CLIENT_SECRET
    }
    _settings = settings;

    _clientSecretCredential = new azure.ClientSecretCredential(
        settings.tenantId,
        settings.clientId,
        settings.clientSecret
    );

    const authProvider = new authProviders.TokenCredentialAuthenticationProvider(
        _clientSecretCredential, {
            scopes: ['https://graph.microsoft.com/.default']
        });
    _appClient = graph.Client.initWithMiddleware({
        authProvider: authProvider
    });
}
module.exports.initializeGraphAuth = initializeGraphAuth;

async function getAppOnlyTokenAsync() {
    // Ensure credential isn't undefined
    if (!_clientSecretCredential) {
      throw new Error('Graph has not been initialized for app-only auth');
    }
  
    // Request token with given scopes
    const response = await _clientSecretCredential.getToken([
      'https://graph.microsoft.com/.default'
    ]);
    return response.token;
}
module.exports.getAppOnlyTokenAsync = getAppOnlyTokenAsync;

async function getUser(net_id) {
    if (!_appClient) {
        throw new Error('Graph has not been initialized for app-only auth');
    }
    return _appClient?.api('/users')
      .filter(`startswith(mail,\'${net_id}\')`)
      .get();
    // INSERT YOUR CODE HERE
}
module.exports.getUser = getUser;

// when we want to GraphCall in our main
  // // Initialize Graph
  // const graphHelper = require('./graphHelper');
  // graphHelper.initializeGraphAuth();
  // try {
  //   const appOnlyToken = await graphHelper.getAppOnlyTokenAsync();
  //   console.log(`App-Only Token: ${appOnlyToken}`);
  //   const response = await graphHelper.getUser(req.body.net_id);
  //   console.log(response);
  // } catch(err) {
  //   console.log(`Error getting yse2 ${err}`);
  // }