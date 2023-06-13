exports.creds = {
    // Required
    identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  
    // Required, the client ID of your app in AAD
    clientID: `${CLIENT_ID}`,
  
    // Required, must be 'code', 'code id_token', 'id_token code' or 'id_token'
    responseType: 'code id_token',
  
    // Required
    responseMode: 'form_post',
  
    // Required, the reply URL registered in AAD for your app
    redirectUrl: `${REDIRECT_URL}`,
  
    // Required if we use http for redirectUrl
    allowHttpForRedirectUrl: true,
  
    // Required if `responseType` is 'code', 'id_token code' or 'code id_token'.
    // If app key contains '\', replace it with '\\'.
    clientSecret: `${CLIENT_SECRET}`,
  
    // Required to set to false if you don't want to validate issuer
    validateIssuer: false,
  
    // Required to set to true if you are using B2C endpoint
    // This sample is for v2 endpoint only, so we set it to false
    isB2C: false,
  
    // Required to set to true if the `verify` function has 'req' as the first parameter
    passReqToCallback: false,
  
    // Recommended to set to true. By default we save state in express session, if this option is set to true, then
    // we encrypt state and save it in cookie instead. This option together with { session: false } allows your app
    // to be completely express session free.
    useCookieInsteadOfSession: true,
  
    // Optional. The additional scope you want besides 'openid', for example: ['email', 'profile'].
    scope: ['profile', 'email'],
  
    // Optional, 'error', 'warn' or 'info'
    loggingLevel: 'info',
  };
  
  // Optional.
  // If you want to get access_token for a specific resource, you can provide the resource here; otherwise,
  // set the value to null.
  // Note that in order to get access_token, the responseType must be 'code', 'code id_token' or 'id_token code'.
  exports.resourceURL = null;
  
  // The url you need to go to destroy the session with AAD
  exports.destroySessionUrl = 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=http://localhost:3000';
  
  // If you want to use the mongoDB session store for session middleware, set to true; otherwise we will use the default
  // session store provided by express-session.
  // Note that the default session store is designed for development purpose only.
  exports.useMongoDBSessionStore = false;
  
  // If you want to use mongoDB, provide the uri here for the database.
  exports.databaseUri = 'mongodb://localhost/OIDCStrategy';
  
  // How long you want to keep session in mongoDB.
  exports.mongoDBSessionMaxAge = 24 * 60 * 60;  // 1 day (unit is second)