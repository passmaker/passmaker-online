(function () {
    'use strict';

    angular.module('sepawall.services.google', [])
        .service('googleService', ['$http', '$rootScope', '$q', 'googleClientConfiguration', function ($http, $rootScope, $q, googleClientConfiguration) {
            var clientId = googleClientConfiguration.clientId,
                scopes = googleClientConfiguration.scopes,
                domain = googleClientConfiguration.domain,
                deferred = $q.defer();

            this.login = function () {
                gapi.auth.authorize({
                    client_id: clientId,
                    scope: scopes,
                    immediate: false
                }, this.handleAuthResult);

                return deferred.promise;
            }

            this.handleClientLoad = function () {
                gapi.auth.init(function () { });
                window.setTimeout(checkAuth, 1);
            };

            this.checkAuth = function() {
                gapi.auth.authorize({
                    client_id: clientId,
                    scope: scopes,
                    immediate: true
                }, this.handleAuthResult);
            };

            this.handleAuthResult = function(authResult) {
                if (authResult && !authResult.error) {
                    var data = {};
                    gapi.client.load('oauth2', 'v2', function () {
                        var request = gapi.client.oauth2.userinfo.get();
                        request.execute(function (resp) {
                            data.email = resp.email;
                        });
                    });
                    deferred.resolve(data);
                } else {
                    deferred.reject('error');
                }
            };

            this.handleAuthClick = function(event) {
                gapi.auth.authorize({
                    client_id: clientId,
                    scope: scopes,
                    immediate: false
                }, this.handleAuthResult);
                return false;
            };

        }]);
})();