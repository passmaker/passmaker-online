describe('pMaker', function() {

  var pMaker;

  beforeEach(module('passwordmaker'));

  beforeEach(inject(function(_pMaker_) {
    pMaker = _pMaker_;
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
});
