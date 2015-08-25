angular.module('passwordmaker', [])

.service('h', function() {

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

  this.supports = function(algorithmName) {
    return getAlgorithm(algorithmName) !== undefined;
  };

  this.generate = function(algo, key, data, chars, length) {
    var h = '';
    for (var i = 0; h.length < length; i++) {
      var alt = i === 0 ? '' : '\n' + i;
      h += getAlgorithm(algo).hash(key + alt, data, chars);
    }
    return h.substring(0, length);
  };

})

.service('pMaker', function($q, h) {

  this.supportedAlgorithms = function() {
    return h.supportedAlgorithms();
  };

  this.generate = function(profile, masterPassword, inputText, username) {
    var deferred = $q.defer();

    var algo = profile.hashAlgorithm,
        mp = masterPassword ? masterPassword : '',
        input = inputText ? inputText : '',
        user = username ? username : '',
        mod = profile.modifier ? profile.modifier : '',
        pLength = profile.passwordLength,
        data = input + user + mod,
        chars = profile.characters;

    var mandatory = [];
    angular.forEach(profile.constraints, function(constraint) {
      if (constraint.amount === 0) {
        var forbiddenChars = constraint.characters.split('');
        for (i = 0; i < forbiddenChars.length; i++) {
          chars = chars.replace(forbiddenChars[i], '');
        }
      } else {
        for (i = 0; i < constraint.amount; i++) {
          mandatory.push(constraint.characters);
        }
      }
    });

    if (!h.supports(algo)) {
      deferred.reject('Unknown algorithm: ' + profile.hashAlgorithm);
    } else if (chars === undefined || chars.length < 2) {
      deferred.reject('Invalid character set: ' + chars);
    } else if (pLength !== parseInt(pLength, 10)) {
      deferred.reject('Invalid password length: ' + pLength);
    } else {
      pLength = pLength - mandatory.length;
      var pass = h.generate(algo, masterPassword, data, chars, pLength);
      angular.forEach(mandatory, function(characters, indexKey) {
        var i = parseInt(h.generate(algo, masterPassword + indexKey, data, '0123456789', pLength.toString().length), '10') % pLength;
        var c = h.generate(algo, masterPassword + indexKey, data, characters + characters, 1);
        pass = [pass.slice(0, i), c, pass.slice(i)].join('');
      });
      deferred.resolve(pass);
    }
    return deferred.promise;
  };

})

;
