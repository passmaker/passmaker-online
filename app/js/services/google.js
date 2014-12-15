angular.module('google.api', [])

  .service('gAuth', function($q, gAuthConfiguration) {

    var self = this;
    self.token = {
      secret: '',
      expiration: Date.now()
    };

    self.check = function() {
      return authorize(true);
    };

    self.login = function() {
      return authorize(false);
    };

    var authorize = function(immediate) {
      var deferred = $q.defer();

      // check token validity before invoking the gapi
      if ('' != self.token.secret && self.token.expiration * 1000 > Date.now()) {
        console.log('Token is valid until ' + self.token.expiration.toLocaleString());
        deferred.resolve(self.token);
      } else {
        // the token must be refreshed
        // 1. load 'gapi.auth' client
        // 2. request authorization
        // 3. handle result
        console.log('Loading Google auth API');
        // 1.
        gapi.load('auth', function() {
          var options = {
            client_id: gAuthConfiguration.clientId,
            scope: gAuthConfiguration.scopes,
            immediate: immediate
          };
          // 2.
          gapi.auth.authorize(options, function(authResult) {
            console.log('Requesting new token');

            self.token.secret = authResult.access_token;
            self.token.expiration = new Date(authResult.expires_at * 1000);

            // 3.
            if (authResult && !authResult.error) {
              console.log('Successfuly got new token valid until ' + self.token.expiration.toLocaleString());
              deferred.resolve(self.token);
            } else {
              console.log('Failed to get new token');
              deferred.reject(authResult);
            }
          });
        });
      }
      return deferred.promise;
    };
  })

  .service('gAuthHttpInterceptor', function(gAuth) {
    return {
      'request': function(config) {
        if (config.url.indexOf('https://www.googleapis.com/') == 0) {
          config.headers['Authorization'] = 'Bearer ' + gAuth.token.secret
        }
        return config;
      }
    };
  })
  
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('gAuthHttpInterceptor');
  })

  .service('gHttp', function($http) {
    return function(command, params) {
      return $http({
        method: command.match(/^\w+/),
        url: 'https://www.googleapis.com' + command.replace(/^\w+ \/?/, '/'),
        params: params
      });
    };
  })

  .service('gDrive', function(gHttp) {

    this.find = function(query) {
      return gHttp('GET /drive/v2/files', {
        'q': query
      });
    };
  });