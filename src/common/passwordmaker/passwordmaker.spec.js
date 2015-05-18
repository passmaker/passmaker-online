describe('pMaker', function() {

  var pMaker, $rootScope;

  beforeEach(module('passwordmaker'));

  beforeEach(inject(function(_pMaker_, _$rootScope_) {
    pMaker = _pMaker_;
    $rootScope = _$rootScope_;
  }));

  it('should knows 10 hash algorithms', function() {
    var algorithms = pMaker.supportedAlgorithms();
    expect(algorithms.length).toEqual(10);
    expect(algorithms).toContain('md5');
    expect(algorithms).toContain('sha1');
    expect(algorithms).toContain('sha256');
    expect(algorithms).toContain('sha512');
    expect(algorithms).toContain('rmd160');
    expect(algorithms).toContain('hmac-md5');
    expect(algorithms).toContain('hmac-sha1');
    expect(algorithms).toContain('hmac-sha256');
    expect(algorithms).toContain('hmac-sha512');
    expect(algorithms).toContain('hmac-rmd160');
  });

  it('can generate bertrand\'s password', function() {
    var profile = {
      hashAlgorithm: 'hmac-sha256',
      passwordLength: 6,
      characters: 'abcd1234'
    };
    var password;
    pMaker.generate(profile, 'secret', 'github.com', 'bertrand').then(function(generatedPassword) {
      password = generatedPassword;
    });
    $rootScope.$apply();
    expect(password).toBe('bc4ab2');
  });

  it('fails on unknown algorithm', function() {
    var profile = {
      hashAlgorithm: 'WTF?',
      passwordLength: 6,
      characters: 'abcd1234'
    };
    var error;
    pMaker.generate(profile, 'secret', 'github.com', 'bertrand').then(undefined, function(message) {
      error = message;
    });
    $rootScope.$apply();
    expect(error).toBe('Unknown algorithm: WTF?');
  });

  it('fails on invalid password length', function() {
    var profile = {
      hashAlgorithm: 'hmac-sha256',
      passwordLength: 'six',
      characters: 'abcd1234'
    };
    var error;
    pMaker.generate(profile, 'secret', 'github.com', 'bertrand').then(undefined, function(message) {
      error = message;
    });
    $rootScope.$apply();
    expect(error).toBe('Invalid password length: six');
  });

  it('fails on too small character set', function() {
    var profile = {
      hashAlgorithm: 'hmac-sha256',
      passwordLength: 6,
      characters: 'X'
    };
    var error;
    pMaker.generate(profile, 'secret', 'github.com', 'bertrand').then(undefined, function(message) {
      error = message;
    });
    $rootScope.$apply();
    expect(error).toBe('Invalid character set: X');
  });

  it('can generate same 20 char password as legacy passwordmaker', function() {
    var profile = {
      hashAlgorithm: 'hmac-sha256',
      passwordLength: 20,
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:";\'<>?,./'
    };
    var password;
    pMaker.generate(profile, '.', '.', '').then(function(generatedPassword) {
      password = generatedPassword;
    });
    $rootScope.$apply();
    expect(password).toEqual('2gSc#fq;R&(]:6|h+>q@');
  });

  it('can generate same 60 char password as legacy passwordmaker', function() {
    var profile = {
      hashAlgorithm: 'hmac-sha256',
      passwordLength: 60,
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:";\'<>?,./'
    };
    var password;
    pMaker.generate(profile, '.', '.', '').then(function(generatedPassword) {
      password = generatedPassword;
    });
    $rootScope.$apply();
    expect(password).toEqual('2gSc#fq;R&(]:6|h+>q@ShI)Ju9l`p.$v<o#{~Oh}f$/Z|Je9CVH8ug/9FtC');
  });

  it('generates a password containing the letter "A" when a constraint "1 of A" is set', function() {
    var profile = {
      hashAlgorithm: 'hmac-sha256',
      passwordLength: 6,
      characters: '0123456789',
      constraints: [ { amount: 1, characters: 'A' } ]
    };
    var password;
    pMaker.generate(profile, 'secret', 'github.com', 'bertrand').then(function(generatedPassword) {
      password = generatedPassword;
    });
    $rootScope.$apply();
    expect(password).toContain('A');
  });
});
