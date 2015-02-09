angular.module( 'passmaker', [
  'templates-app',
  'templates-common',
  'ui.router',
  'ui.bootstrap.collapse',
  // internal deps
  'google.api',
  'passwordmaker',
  'passmaker.generator',
  'passmaker.configuration'
])

.constant('passMakerVersion', 'v0.1.0')

.constant('gAuthConfiguration', {
  clientId: '452858183186-vnq9jcgt1heeveppo8nrnsvn1sep0q15.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive.file'
  ]
})

.config(function($urlRouterProvider) {
  $urlRouterProvider.otherwise('/generator');
})

.run(function($location, $window) {
  // force https protocol on domain passmaker.github.io (production)
  if ('https' != $location.protocol() && 'passmaker.github.io' == $location.host()) {
    console.log('Detected unsecure protocol, redirecting to https version');
    $window.location.href = $location.absUrl().replace(/^http:/, 'https:');
  }
})

.controller('PassMakerCtrl', function($scope, gAuth, passMakerConf) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (angular.isDefined(toState.data.pageTitle)) {
      $scope.pageTitle = toState.data.pageTitle ;
    }
  });

  $scope.ready = false;

  gAuth.check().then(function(authResult) {
      console.log('Authentication check completed');
      console.log(authResult);
      $scope.ready = true;
      passMakerConf.load();
    }, function(authResult) {
      console.log('Authentication check failed');
      console.log(authResult);
      $scope.ready = false;
    });
  
  $scope.login = function() {
    gAuth.login();
  };

})

.service('profile', function() {
  return {
    'hashAlgorithm': '',
    'passwordLength': '',
    'characters': '',
    'exceptions': []
  };
})

.service('passMakerConf', function($q, gDrive, profile, passMakerVersion) {

  var update = function(newProfile) {
    profile.hashAlgorithm = newProfile.hashAlgorithm;
    profile.passwordLength = newProfile.passwordLength;
    profile.characters = newProfile.characters;
    profile.exceptions = newProfile.exceptions;
  };

  var findConfigurationFile = function() {
    var query = "properties has { key='passmaker-version' and value ='" + passMakerVersion + "' and visibility='PRIVATE' }";
    var deferred = $q.defer();
    gDrive.find(query)
      .success(function(response) {
        if (response.items.length == 1) {
          deferred.resolve(response.items[0]);
        } else if (response.items.length > 1) {
          deferred.reject('More than one PassMaker configuration');
        } else {
          deferred.reject('No PassMaker configuration');
        }
      })
      .error(function(response) {
        deferred.reject('Error loading configuration');
      });
    return deferred.promise;
  };

  this.load = function() {
    console.log('Retrieving configuration from Google Drive storage');
    findConfigurationFile().then(function(fileMetadata) {
      gDrive.get(fileMetadata.id).success(function(content) {
        update(angular.fromJson(content));
      });
    });
  };

  this.save = function() {
    var mime = 'text/plain',
        data = angular.toJson(profile, true),
        metadata = {
          'title' : 'passmaker.json',
          'description' : 'PassMaker configuration file',
          'properties' : [ {
              'key': 'passmaker-version',
              'value': passMakerVersion,
              'visibility': 'PRIVATE'
            }
          ]
        };
    findConfigurationFile().then(function(fileMetadata) {
      gDrive.update(fileMetadata.id, mime, data, metadata);
    }, function() {
      gDrive.create(mime, data, metadata);
    });
  };
})

.service('profileManager', function (profile) {
  this.getProfile = function(inputText) {
    var p = {
      custom: false,
      hashAlgorithm: profile.hashAlgorithm,
      characters: profile.characters,
      passwordLength: profile.passwordLength
    };
    angular.forEach(profile.exceptions, function(exception) {
      if (inputText && inputText == exception.service) {
        p.custom = true;
        if (exception.passwordLength.override === true) {
          p.passwordLength = exception.passwordLength.value;
        }
        if (exception.modifier.override === true) {
          p.modifier = exception.modifier.value;
        }
        if (exception.characters.override === true) {
          p.characters = exception.characters.value;
        }
      }
    });
    return p;
  };
})

;

