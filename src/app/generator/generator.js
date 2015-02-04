angular.module('passmaker.generator', [
  'ui.router'
])

.config(function($stateProvider) {
  $stateProvider.state('generator', {
    url: '/generator',
    templateUrl: 'generator/generator.tpl.html',
    controller: 'PasswordGeneratorCtrl',
    data: { pageTitle: 'Password Generator' }
  });
})

.controller('PasswordGeneratorCtrl', function($scope, profileManager, pMaker) {

  $scope.generatePassword = function() {
    // generate a random value to display the master password control hash
    var pHashCheck = {
      hashAlgorithm: 'sha1',
      characters: 'ABCDEFGHIFKLMNOPQRSTUVWXYZ',
      passwordLength: 3
    };
    pMaker.generate(pHashCheck, $scope.masterPassword, 'hashcheck', '')
      .then(function(hash) {
        $scope.controlHash = hash;
      });

    // generate the final password
    var p = profileManager.getProfile($scope.inputText);
    $scope.customProfile = p.custom;
    pMaker.generate(p, $scope.masterPassword, $scope.inputText, $scope.username)
      .then(function(generatedPassword) {
        $scope.error = '';
        $scope.generatedPassword = generatedPassword;
      }, function(error) {
        $scope.error = error;
      });
  };
})

;
