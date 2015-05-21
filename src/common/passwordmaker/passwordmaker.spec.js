describe('hash service', function() {

  var h, runs;

  beforeEach(module('passwordmaker'));

  beforeEach(inject(function(_h_) {
    h = _h_;
  }));

  it('should know 10 hash algorithms', function() {
    var algorithms = h.supportedAlgorithms();
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

  runs = [ 'md5', 'sha1', 'sha256', 'sha512', 'rmd160', 'md5', 'hmac-sha1', 'hmac-sha256', 'hmac-sha512', 'hmac-rmd160' ];
  runs.forEach(function(algo) {
    it('should support algorithm ' + algo, function() {
      expect(h.supports(algo)).toBeTruthy();
    });
  });

  it('should return false when asking for an unsupported algorithm', function() {
    expect(h.supports('sha1024')).toBeFalsy();
  });

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:";\'<>?,./';
  runs = [
    { algo: 'md5'         , result: 'ERg%+3zR\'],WM,*oF\'\'r' },
    { algo: 'md5'         , result: 'ERg%+3zR\'],WM,*oF\'\'rGLE8~N-z]qb0&s2(?$!]' },
    { algo: 'sha1'        , result: 'E~a=*>Et85(|>CAVTwev' },
    { algo: 'sha1'        , result: 'E~a=*>Et85(|>CAVTwevX1pyqC[j\\KtPF#2_ks5/' },
    { algo: 'sha256'      , result: ')9tj$5D&T.]Ur9?I+kzK' },
    { algo: 'sha256'      , result: ')9tj$5D&T.]Ur9?I+kzKh=kB!AZ??<Bsb+qCL`[B' },
    { algo: 'sha512'      , result: '%&Xu:5y-17-+~yYuUTen' },
    { algo: 'sha512'      , result: '%&Xu:5y-17-+~yYuUTenE]zfnt]gX@D`l!2hIIO9`kL\'$B48C?' },
    { algo: 'rmd160'      , result: 'mF:Ckd<5u8IL|uKYG"dC' },
    { algo: 'rmd160'      , result: 'mF:Ckd<5u8IL|uKYG"dCuIoTGKQm;zVNp~VMv72.' },
    { algo: 'hmac-md5'    , result: 'IHZhIA8%G{<2+6y;u<Be' },
    { algo: 'hmac-md5'    , result: 'IHZhIA8%G{<2+6y;u<BeJWueXn!N(lP?Z~c?T4&eIv"jiF&cu4' },
    { algo: 'hmac-sha1'   , result: 'C}vt@G=\\drvN}!EZma/z' },
    { algo: 'hmac-sha1'   , result: 'C}vt@G=\\drvN}!EZma/zKv,U:D%1Sb!3/fR]m~nK&Z,/l_F7h$' },
    { algo: 'hmac-sha256' , result: ']9ui,dd"?Sv:LO:9nMK,' },
    { algo: 'hmac-sha256' , result: ']9ui,dd"?Sv:LO:9nMK,e#3Py1\\KZvt%t8y^P<CiH<),\\a>q9"' },
    { algo: 'hmac-sha256' , result: ']9ui,dd"?Sv:LO:9nMK,e#3Py1\\KZvt%t8y^P<CiH<),\\a>q9"$$\\;H{S00_+x^c$*nY1hhlg/aOx<nJFEwL1v;i@U2anTU9wKb2Q{DP$+_dQ\\R2?Fj0/BC+<HF}O7}Ef`pT=N)-YSf&' },
    { algo: 'hmac-sha512' , result: 'GSVCw5o#0D((OQxv@K~R' },
    { algo: 'hmac-sha512' , result: 'GSVCw5o#0D((OQxv@K~R@&p99Tin7<<_zf<o+g)!5#K}op9a/\\' },
    { algo: 'hmac-rmd160' , result: 'DOI.5s<XwPg|t>W\\XUT[' },
    { algo: 'hmac-rmd160' , result: 'DOI.5s<XwPg|t>W\\XUT[L.9yeEF?kX^WJu,;;@F{=D_];Hskfx' }
  ];

  runs.forEach(function(test) {
    it('should return ' + test.result + ' when generating a ' + test.algo + ' hash', function() {
      var hash = h.generate(test.algo, 'secret', 'github.com' + 'bertrand', chars, test.result.length);
      expect(hash).toBe(test.result);
    });
  });
});

describe('pMaker', function() {

  var pMaker, $rootScope;

  beforeEach(module('passwordmaker'));

  beforeEach(inject(function(_pMaker_, _$rootScope_) {
    pMaker = _pMaker_;
    $rootScope = _$rootScope_;
  }));

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
