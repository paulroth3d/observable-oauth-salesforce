const SampleModule = require('../src/modules/SampleModule');

describe('can add', () => {
  test('1 + 1 should be 2', (done) => {
    const result = SampleModule.sum(1, 1);
    const expected = 2;
    expect(result).toBe(expected);
    done();
  });

  test('1+2 should not be love', (done) => {
    expect(SampleModule.sum(1, 2)).toBe(3);
    done();
  });
});
