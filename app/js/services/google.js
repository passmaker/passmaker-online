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
    this.req = function(command) {

      var self = this;
      var request = {
        method: 'GET',
        url: '',
        headers: {},
        params: {}
      };
      var multipartBoundary = new Date().getTime();// + '#SEPAWALL';
      var parts = [];

      if (command) {
        request.method = String(command.match(/^\w+/));
        request.url = 'https://www.googleapis.com' + command.replace(/^\w+ \/?/, '/');
      }

      this.method = function(method) {
        request.method = method;
        return self;
      };

      this.url = function(url) {
        request.url = url;
        return self;
      };

      this.header = function(name, value) {
        request.headers[name] = value;
        return self;
      };

      this.param = function(name, value) {
        request.params[name] = value;
        return self;
      };

      this.data = function(data) {
        request.data = data;
        parts = {};
        return self;
      };

      this.multipart = function(mimeType, content) {
        parts.push('--' + multipartBoundary);
        parts.push('Content-Type: ' + mimeType);
        parts.push('');
        parts.push(content);
        return self;
      };


      self.$http = function() {
        if (parts.length > 0 ) {
          self.header('Content-Type', 'multipart/related; boundary="' + multipartBoundary + '"');
          self.param('uploadType', 'multipart');
          parts.push('--' + multipartBoundary + '--');
          request.data = parts.join('\r\n');
        }
        return $http(request);
      };

      return self;
    };
  })

  .service('gDrive', function(gHttp) {

    this.get = function(fileId) {
      return gHttp.req('GET /drive/v2/files/' + fileId)
                  .param('alt', 'media')
                  .param('updateViewedDate', true)
                  .$http();
    };

    this.find = function(query) {
      var q = query instanceof Array ? query.join(' and ') : query
      return gHttp.req('GET /drive/v2/files')
                  .param('q', q)
                  .$http();
    };

    this.create = function(mimeType, content, metadata) {
      return gHttp.req('POST /upload/drive/v2/files')
                  .multipart('application/json; charset=UTF-8', angular.toJson(metadata, true))
                  .multipart(mimeType, content)
                  .$http();
    };

    this.update = function(fileId, mimeType, content, newRevision) {
      return gHttp.req('PUT /upload/drive/v2/files/' + fileId)
                  .header('Content-Type', mimeType)
                  .param('newRevision', newRevision)
                  .data(content)
                  .$http();
    };
  });