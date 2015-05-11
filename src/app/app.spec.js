describe('profileManager', function() {

  var profileManager;

  var exception;

  beforeEach(module('passmaker'));

  beforeEach(function() {
    exception = {
      service: 'exception-website.com',
      passwordLength: { override: false },
      modifier:       { override: false }
    };
  });

  beforeEach(function() {
    var mockProfile = {
      hashAlgorithm:  'default-hash',
      characters:     'default-characters',
      passwordLength: 6,
      exceptions: [ exception ]
    };
    module(function($provide) {
      $provide.value('profile', mockProfile);
    });
  });

  beforeEach(inject(function(_profileManager_) {
    profileManager = _profileManager_;
  }));

  it('should return default profile when no exception matches', inject(function() {
    var p = profileManager.getProfile('any-website.com');
    expect(p).toEqual({
      custom: false,
      hashAlgorithm: 'default-hash',
      passwordLength: 6,
      characters: 'default-characters',
      modifier: undefined
    });
  }));

  it('should return custom profile when password length is overrided', inject(function() {
    exception.passwordLength = { override: true, value: 5 };

    var p = profileManager.getProfile('exception-website.com');

    expect(p).toEqual({
      custom: true,
      hashAlgorithm: 'default-hash',
      passwordLength: 5,
      characters: 'default-characters',
      modifier: undefined
    });
  }));

  it('should return custom profile when a modifier is set', inject(function() {
    exception.modifier = { override: true, value: 'alt' };

    var p = profileManager.getProfile('exception-website.com');

    expect(p).toEqual({
      custom: true,
      hashAlgorithm: 'default-hash',
      passwordLength: 6,
      characters: 'default-characters',
      modifier: 'alt'
    });
  }));

});
