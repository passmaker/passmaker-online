var sepawall = angular.module('sepawall', [
  'ngRoute',
  'ui.bootstrap.dropdown',
  'ui.bootstrap.tooltip',
  'googleApi'
]);

sepawall.run(['$location', '$rootScope', function($location, $rootScope) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    if (current.hasOwnProperty('$$route')) {
      $rootScope.title = current.$$route.title;
    }
  });
}]);

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
    }).otherwise({
      redirectTo: '/generator'
    });
});

sepawall.config(function(googleLoginProvider) {

  googleLoginProvider.configure({
    clientId: '452858183186-vnq9jcgt1heeveppo8nrnsvn1sep0q15.apps.googleusercontent.com',
    scopes: [
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

});

sepawall.controller('storage-management', function($scope, googleLogin) {

  $scope.login = function() {
    googleLogin.login();
  }

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

sepawall.controller('ConfigurationEditor', function($scope) {

  $scope.addException = function() {
    $scope.conf.exceptions.push({
      'service': 'New service name',
      'passwordLength': '',
      'modifier': ''
    });
  }

  $scope.removeException = function(i) {
    $scope.conf.exceptions.splice(i, 1);
  }

  $scope.saveConfiguration = function() {
    console.log(JSON.stringify($scope.conf, null, ' '));
  };

  $scope.conf = {
    'exceptions' : [ {
      'service': 'facebook.com'
    }, {
      'service': 'likedin.com'
    } ]
  }

});

sepawall.controller('configuration-manager', function($scope) {

  $scope.$on("googleDrive:loaded", function() {
    console.log('google drive api loaded');
  });

  $scope.create = function() {
    var request = gapi.client.request({
     'path': '/drive/v2/files',
     'method': 'POST',
     'body': {
       "title" : "Meta File 1.json",
       "mimeType" : "application/json",
       "description" : "This is a test of creating a metafile"
      }
    });
    request.execute(function(file) {
      console.log(file);
    });
  };

});
