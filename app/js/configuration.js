(function () {
    'use strict';

    angular.module('sepawall.configuration', [])

        .value('googleClientConfiguration', {
            clientId: '452858183186-vnq9jcgt1heeveppo8nrnsvn1sep0q15.apps.googleusercontent.com',
            scopes: [
              'https://www.googleapis.com/auth/drive.file'
            ],
            domain: 'localhost'
         });

})();