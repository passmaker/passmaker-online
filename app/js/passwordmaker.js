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
    
    var factory = [];
    factory['sha1']   = noHmac(Hashes.SHA1);
    factory['sha256'] = noHmac(Hashes.SHA256);
    factory['sha512'] = noHmac(Hashes.SHA512);
    factory['rmd160'] = noHmac(Hashes.RMD160);
    factory['hmac-sha1']   = hmac(Hashes.SHA1);
    factory['hmac-sha256'] = hmac(Hashes.SHA256);
    factory['hmac-sha512'] = hmac(Hashes.SHA512);
    factory['hmac-rmd160'] = hmac(Hashes.RMD160);

    return function(profile, masterPassword, inputText, username) {
      var hash = factory[profile.hashAlgorithm],
          mp = masterPassword ? masterPassword : '',
          input = inputText ? inputText : '',
          user = username ? username : '',
          mod = profile.modifier ? profile.modifier : '',
          pLength = profile.passwordLength,
          data = input + user + mod,
          chars = profile.characters;

      var password = '';
      for (var i = 0; password.length < pLength; i++) {
        var alt = i == 0 ? '' : '\n' + i;
        password += hash(masterPassword + alt, data, chars);
      }
      return password.substring(0, pLength);
    };

  });
