var sepawall = angular.module('sepawall', [
  'ngRoute',
  'ui.bootstrap.dropdown',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.modal',
  'sepawall.configuration',
  'google.api'
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
      redirectTo: '/test'
    });
});

sepawall.factory('configuration', function() {
  var confHolder = {
    'hashAlgorithm': '',
    'passwordLength': '',
    'characters': '',
    'exceptions': []
  };
  return {
    get: function() { return confHolder; },
    set: function(conf) { confHolder = conf; },
    load: function(callback) {
      var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {
          'q': "properties has { key='sepawall-id' and value ='AZERTY-sepawall' and visibility='PRIVATE' }"
        }
      });
      request.execute(callback);
    },
    save: function() {
      var boundary = new Date().getTime();
      var delimiter = '--' + boundary;
      var metadata = {
        'title' : 'sepawall.json',
        'description' : 'Secure Password Wallet configuration file',
        'properties' : [ {
            'key': 'sepawall-id',
            'value': 'AZERTY-sepawall',
            'visibility': 'PRIVATE'
          }
        ]
      };
      var bodyParts = [
        delimiter,
        'Content-Type: application/json',
        '',
        angular.toJson(metadata, true),
        delimiter,
        'Content-Type: application/json',
        '',
        angular.toJson(confHolder, true),
        delimiter + '--'
      ];
      var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {
          'uploadType': 'multipart',
          'visibility': 'PRIVATE'
        },
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': bodyParts.join('\r\n')
      });
      request.execute(function(file) {
        console.log(file);
      });
    }
  };
});

sepawall.controller('CloudLogin', function($scope, $http, gAuth) {

  $scope.ready = false;

  gAuth.check().then(function(authResult) {
      console.log('Authentication check completed');
      console.log(authResult);
      $scope.ready = true;
    }, function(authResult) {
      console.log('Authentication check completed');
      console.log(authResult);
      $scope.ready = false;
    });
  
  $scope.login = function() {
    gAuth.login();
  };

});

sepawall.controller('PasswordGenerator', function($scope) {

  var makePassword = function(hashAlgorithm, key, data,  charset) {
    return PasswordMaker_MD5.any_md5(key + data, charset)
  };
  
  $scope.generatePassword = function() {
    console.log('begin password generation');
    var password = "";
    var count = 0;
    while (password.length < $scope.passwordLength) {
      console.log('count: ' + count);
      var key = $scope.masterPassword;
      if (count > 0) {
        key += '\n' + count;
      }
      password += makePassword($scope.hashAlgorithm,
                         key,
                         $scope.inputText + $scope.username + $scope.modifier,
                         $scope.characters);
      count++;
    }
    console.log('end password generation');
    $scope.generatedPassword = password.substring(0, $scope.passwordLength);
  };

});

sepawall.controller('ConfigurationEditor', function($scope, $modal, configuration, gDrive) {

  $scope.hashAlgorithms = ["sha256", "hmac-sha256", "hmac-sha256_fix", "sha1", "hmac-sha1", "md4", "hmac-md4", "md5", "md5_v6", "hmac-md5", "hmac-md5_v6", "rmd160", "mac-rmd160"];

  $scope.conf = configuration.get();

  $scope.addException = function() {
    $scope.conf.exceptions = $scope.conf.exceptions || [];
    $scope.conf.exceptions.push({
      'service': 'New service name',
      'passwordLength': '',
      'modifier': ''
    });
  }

  $scope.removeException = function(i) {
    $scope.conf.exceptions.splice(i, 1);
  }

  $scope.restoreConfiguration = function() {
    gDrive.find("properties has { key='sepawall-id' and value ='AZERTY-sepawall' and visibility='PRIVATE' }").then(function(loadedConf) {
      $scope.conf = loadedConf;
    });
  };

  $scope.showConfiguration = function() {
    var stringConf = angular.toJson(configuration.get(), true);
    $modal.open({
      template: '<div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Configuration</h4></div><div class="modal-body"><pre>' + stringConf + '</pre></div>'
    });
  };

  $scope.saveConfiguration = function() {
    configuration.set($scope.conf);
    configuration.save();
    console.log(angular.toJson(configuration.get(), true));
  };

});

sepawall.controller('test', function($scope, gAuthService) {

});
