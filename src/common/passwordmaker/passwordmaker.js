angular.module('passwordmaker', [])

.service('pMaker', function() {

  var noHmac = function(Algo) {
    return function(key, data, chars) {
      return new Algo().any(key + data, chars);
    };
  };
  var hmac = function(Algo) {
    return function(key, data, chars) {
      return new Algo().any_hmac(key, data, chars);
    };
  };
  
  var algorithms = [
    { name: 'md5'        , hash: noHmac(Hashes.MD5)    },
    { name: 'sha1'       , hash: noHmac(Hashes.SHA1)   },
    { name: 'sha256'     , hash: noHmac(Hashes.SHA256) },
    { name: 'sha512'     , hash: noHmac(Hashes.SHA512) },
    { name: 'rmd160'     , hash: noHmac(Hashes.RMD160) },
    { name: 'hmac-md5'   , hash:   hmac(Hashes.MD5)    },
    { name: 'hmac-sha1'  , hash:   hmac(Hashes.SHA1)   },
    { name: 'hmac-sha256', hash:   hmac(Hashes.SHA256) },
    { name: 'hmac-sha512', hash:   hmac(Hashes.SHA512) },
    { name: 'hmac-rmd160', hash:   hmac(Hashes.RMD160) }
  ];

  var getAlgorithm = function(algorithmName) {
    var searchedAlgo;
    angular.forEach(algorithms, function(algo) {
      if (algo.name == algorithmName) {
        searchedAlgo = algo;
      }
    });
    return searchedAlgo;
  };

  this.supportedAlgorithms = function() {
    var names = [];
    angular.forEach(algorithms, function(algo) {
      names.push(algo.name);
    });
    return names;
  };

  this.generate = function(profile, masterPassword, inputText, username) {
    var hash = getAlgorithm(profile.hashAlgorithm).hash,
        mp = masterPassword ? masterPassword : '',
        input = inputText ? inputText : '',
        user = username ? username : '',
        mod = profile.modifier ? profile.modifier : '',
        pLength = profile.passwordLength,
        data = input + user + mod,
        chars = profile.characters;

    var password = '';
    for (var i = 0; password.length < pLength; i++) {
      var alt = i === 0 ? '' : '\n' + i;
      password += hash(masterPassword + alt, data, chars);
    }
    return password.substring(0, pLength);
  };

})

;