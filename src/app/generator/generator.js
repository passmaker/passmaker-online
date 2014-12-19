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

  var pHashCheck = {
    hashAlgorithm: 'sha1',
    characters: '01',
    passwordLength: 9
  };

  $scope.generatePassword = function() {
    var p = profileManager.getProfile($scope.inputText);
    $scope.customProfile = p.custom;
    $scope.generatedPassword = pMaker.generate(p, $scope.masterPassword, $scope.inputText, $scope.username);
    $scope.controlHash = parseInt(pMaker.generate(pHashCheck, $scope.masterPassword, 'hashcheck', ''), 2);
  };
})

;