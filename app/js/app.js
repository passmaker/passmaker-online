var sepawall = angular.module('sepawall', [
  'ngRoute',
  'ui.utils',
  'ui.bootstrap.collapse',
  'ui.bootstrap.transition',
  'ui.bootstrap.modal',
  'google.api',
  'sepawall.configuration',
  'passwordmaker'
]);

sepawall.run(function($rootScope) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    if (current.hasOwnProperty('$$route')) {
      $rootScope.title = current.$$route.title;
    }
  });
});

sepawall.config(function($routeProvider) {
  $routeProvider
    .when('/generator', {
      title: 'Password generator',
      templateUrl: 'partials/generator.html',
      controller: 'PasswordGenerator'
    })
    .when('/configuration', {
      title: 'Configuration editor',
      templateUrl: 'partials/configuration.html',
      controller: 'ConfigurationEditor'
    })
    .when('/test', {
      title: 'test',
      templateUrl: 'partials/test.html',
      controller: 'test'
    })
    .otherwise({
      redirectTo: '/generator'
    });
});

sepawall.service('profile', function() {
  return {
    'hashAlgorithm': '',
    'passwordLength': '',
    'characters': '',
    'exceptions': []
  };
});

sepawall.service('sepawallConf', function($q, gDrive, profile, sepawallVersion) {

  var update = function(newProfile) {
    profile.hashAlgorithm = newProfile.hashAlgorithm;
    profile.passwordLength = newProfile.passwordLength;
    profile.characters = newProfile.characters;
    profile.exceptions = newProfile.exceptions;
  };

  var findConfigurationFile = function() {
    var query = "properties has { key='sepawall-version' and value ='" + sepawallVersion + "' and visibility='PRIVATE' }";
    var deferred = $q.defer();
    gDrive.find(query)
      .success(function(response) {
        if (response.items.length == 1) {
          deferred.resolve(response.items[0]);
        } else if (response.items.length > 1) {
          deferred.reject('More than one sepawall configuration');
        } else {
          deferred.reject('No sepawall configuration');
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
          'title' : 'sepawall.json',
          'description' : 'Secure Password Wallet configuration file',
          'properties' : [ {
              'key': 'sepawall-version',
              'value': 'v1',
              'visibility': 'PRIVATE'
            }
          ]
        };
    findConfigurationFile().then(function(fileMetadata) {
      gDrive.update(fileMetadata.id, mime, data, metadata);
    }, function() {
      gDrive.create(mime, data, metadata)
    });
  };
});

sepawall.controller('CloudLogin', function($scope, $http, gAuth, sepawallConf) {

  $scope.ready = false;

  gAuth.check().then(function(authResult) {
      console.log('Authentication check completed');
      console.log(authResult);
      $scope.ready = true;
      sepawallConf.load();
    }, function(authResult) {
      console.log('Authentication check completed');
      console.log(authResult);
      $scope.ready = false;
    });
  
  $scope.login = function() {
    gAuth.login();
  };

});

sepawall.service('profileManager', function(profile) {
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
        if (exception.passwordLength.override == true) {
          p.passwordLength = exception.passwordLength.value;
        }
        if (exception.modifier.override == true) {
          p.modifier = exception.modifier.value;
        }
      };
    });
    return p;
  };
});

sepawall.controller('PasswordGenerator', function($scope, profileManager, pMaker) {
  
  $scope.generatePassword = function() {
    var p = profileManager.getProfile($scope.inputText);
    $scope.customProfile = p.custom;
    $scope.generatedPassword = pMaker.generate(p, $scope.masterPassword, $scope.inputText, $scope.username);
  };
});

sepawall.controller('ConfigurationEditor', function($scope, profile, sepawallConf, pMaker) {

  $scope.hashAlgorithms = pMaker.supportedAlgorithms();

  $scope.profile = profile;

  $scope.addException = function() {
    $scope.profile.exceptions = $scope.profile.exceptions || [];
    $scope.profile.exceptions.push({
      'service': 'New service name',
      'passwordLength': { 'override': false, 'value': ''},
      'modifier': { 'override': false, 'value': ''}
    });
  }

  $scope.removeException = function(i) {
    $scope.profile.exceptions.splice(i, 1);
  }

  $scope.restoreConfiguration = function() {
    sepawallConf.load()
  };


  $scope.showConfiguration = function() {
//     var stringProfile = angular.toJson(profile, true);
//     $modal({
//       title: 'Configuration',
//       content:'<pre>' + stringProfile + '</pre>',
//       html: true
//     });
  };

  $scope.saveConfiguration = function() {
    sepawallConf.save();
  };
});

sepawall.controller('test', function($scope, gAuthService) {

});
