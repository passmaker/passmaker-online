angular.module('passmaker.configuration', [
  'ui.router',
  'ui.bootstrap.modal',
  'ui.bootstrap.tpls'
])

.config(function($stateProvider) {
  $stateProvider.state('configuration', {
    url: '/configuration',
    templateUrl: 'configuration/configuration.tpl.html',
    controller: 'ConfigurationCtrl',
    data: { pageTitle: 'Configuration' }
  });
})

.controller('ConfigurationCtrl', function($scope, profile, pMaker, passMakerConf, $modal) {

  $scope.hashAlgorithms = pMaker.supportedAlgorithms();

  $scope.profile = profile;

  $scope.addException = function() {
    $scope.profile.exceptions = $scope.profile.exceptions || [];
    $scope.profile.exceptions.push({
      'service': 'New service name',
      'passwordLength': { 'override': false, 'value': ''},
      'modifier': { 'override': false, 'value': ''}
    });
  };

  $scope.removeException = function(i) {
    $scope.profile.exceptions.splice(i, 1);
  };

  $scope.restoreConfiguration = function() {
    passMakerConf.load();
  };


  $scope.showConfiguration = function() {
    var stringProfile = angular.toJson(profile, true);
    $modal.open({
      template: '<div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Configuration</h4></div><div class="modal-body"><pre>' + stringProfile + '</pre></div>'
    });
  };

  $scope.saveConfiguration = function() {
    passMakerConf.save();
  };
})

.service('profileManager', function(profile) {
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
      }
    });
    return p;
  };
})

;
