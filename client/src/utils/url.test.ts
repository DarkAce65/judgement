import { describe, expect, it } from 'vitest';

import { join } from './url';

describe('empty segments', () => {
  it('joins empty segments', () => {
    expect(join('')).toBe('');
    expect(join('', '')).toBe('');
    expect(join('', '', '')).toBe('');
  });

  describe('slashes and empty segments', () => {
    const segments = ['', '/', '//', '///'];

    describe('one component', () => {
      const tests = [];
      for (const segment1 of segments) {
        tests.push([segment1]);
      }

      it.each(tests)('join(%p)', (segment1: string) => {
        let expected = '/';
        if (segment1.length === 0) {
          expected = '';
        } else if ([segment1].filter((s) => s.length > 0)[0].length >= 2) {
          expected = '//';
        }

        expect(join(segment1)).toBe(expected);
      });
    });

    describe('two components', () => {
      const tests = [];
      for (const segment1 of segments) {
        for (const segment2 of segments) {
          tests.push([segment1, segment2]);
        }
      }

      it.each(tests)('join(%p, %p)', (segment1: string, segment2: string) => {
        let expected = '/';
        if ((segment1 + segment2).length === 0) {
          expected = '';
        } else if ([segment1, segment2].filter((s) => s.length > 0)[0].length >= 2) {
          expected = '//';
        }

        expect(join(segment1, segment2)).toBe(expected);
      });
    });

    describe('three components', () => {
      const tests = [];
      for (const segment1 of segments) {
        for (const segment2 of segments) {
          for (const segment3 of segments) {
            tests.push([segment1, segment2, segment3]);
          }
        }
      }

      it.each(tests)('join(%p, %p, %p)', (segment1: string, segment2: string, segment3: string) => {
        let expected = '/';
        if ((segment1 + segment2 + segment3).length === 0) {
          expected = '';
        } else if ([segment1, segment2, segment3].filter((s) => s.length > 0)[0].length >= 2) {
          expected = '//';
        }

        expect(join(segment1, segment2, segment3)).toBe(expected);
      });
    });
  });

  it('joins a non-empty segment with empty segments', () => {
    expect(join('a', '')).toBe('a');
    expect(join('/a', '')).toBe('/a');
    expect(join('a/', '')).toBe('a/');
    expect(join('/a/', '')).toBe('/a/');

    expect(join('', 'a')).toBe('a');
    expect(join('', '/a')).toBe('/a');
    expect(join('', 'a/')).toBe('a/');
    expect(join('', '/a/')).toBe('/a/');

    expect(join('a', '', '')).toBe('a');
    expect(join('/a', '', '')).toBe('/a');
    expect(join('a/', '', '')).toBe('a/');
    expect(join('/a/', '', '')).toBe('/a/');

    expect(join('', 'a', '')).toBe('a');
    expect(join('', '/a', '')).toBe('/a');
    expect(join('', 'a/', '')).toBe('a/');
    expect(join('', '/a/', '')).toBe('/a/');

    expect(join('', '', 'a')).toBe('a');
    expect(join('', '', '/a')).toBe('/a');
    expect(join('', '', 'a/')).toBe('a/');
    expect(join('', '', '/a/')).toBe('/a/');
  });
});

it('joins a non-empty segment with slashes', () => {
  expect(join('a', '/')).toBe('a/');
  expect(join('/a', '/')).toBe('/a/');
  expect(join('a/', '/')).toBe('a/');
  expect(join('/a/', '/')).toBe('/a/');

  expect(join('/', 'a')).toBe('/a');
  expect(join('/', '/a')).toBe('/a');
  expect(join('/', 'a/')).toBe('/a/');
  expect(join('/', '/a/')).toBe('/a/');

  expect(join('a', '/', '/')).toBe('a/');
  expect(join('/a', '/', '/')).toBe('/a/');
  expect(join('a/', '/', '/')).toBe('a/');
  expect(join('/a/', '/', '/')).toBe('/a/');

  expect(join('/', 'a', '/')).toBe('/a/');
  expect(join('/', '/a', '/')).toBe('/a/');
  expect(join('/', 'a/', '/')).toBe('/a/');
  expect(join('/', '/a/', '/')).toBe('/a/');

  expect(join('/', '/', 'a')).toBe('/a');
  expect(join('/', '/', '/a')).toBe('/a');
  expect(join('/', '/', 'a/')).toBe('/a/');
  expect(join('/', '/', '/a/')).toBe('/a/');
});

describe('non-empty segments', () => {
  const firstSegments = ['a', '/a', 'a/', '/a/'];
  const secondSegments = ['b', '/b', 'b/', '/b/'];
  const thirdSegments = ['c', '/c', 'c/', '/c/'];

  describe('one segment', () => {
    const tests = [];
    for (const segment1 of firstSegments) {
      const expected = segment1;
      tests.push([segment1, expected]);
    }

    it.each(tests)('join(%p)', (segment1: string, expected: string) => {
      expect(join(segment1)).toBe(expected);
    });
  });

  describe('two segments', () => {
    const tests = [];
    for (const segment1 of firstSegments) {
      for (const segment2 of secondSegments) {
        let expected = 'a/b';
        if (segment1.startsWith('/')) {
          expected = `/${expected}`;
        }
        if (segment2.endsWith('/')) {
          expected += '/';
        }

        tests.push([segment1, segment2, expected]);
      }
    }

    it.each(tests)('join(%p, %p)', (segment1: string, segment2: string, expected: string) => {
      expect(join(segment1, segment2)).toBe(expected);
    });
  });

  describe('three segments', () => {
    const tests = [];
    for (const segment1 of firstSegments) {
      for (const segment2 of secondSegments) {
        for (const segment3 of thirdSegments) {
          let expected = 'a/b/c';
          if (segment1.startsWith('/')) {
            expected = `/${expected}`;
          }
          if (segment3.endsWith('/')) {
            expected += '/';
          }

          tests.push([segment1, segment2, segment3, expected]);
        }
      }
    }

    it.each(tests)(
      'join(%p, %p, %p)',
      (segment1: string, segment2: string, segment3: string, expected: string) => {
        expect(join(segment1, segment2, segment3)).toBe(expected);
      }
    );
  });
});

it('tests edge cases for joining', () => {
  expect(join()).toBe('');

  expect(join('', '/', '/a')).toBe('/a');

  expect(join('//test.domain.com')).toBe('//test.domain.com');
  expect(join('//', 'test.domain.com')).toBe('//test.domain.com');

  expect(join('file:')).toBe('file://');
  expect(join('file:/')).toBe('file://');
  expect(join('file:///')).toBe('file:///');
  expect(join('file:etc')).toBe('file://etc');
  expect(join('file:', 'etc', 'fstab')).toBe('file://etc/fstab');
  expect(join('file://', 'etc', 'fstab')).toBe('file://etc/fstab');
  expect(join('file://', '/etc', 'fstab')).toBe('file:///etc/fstab');
  expect(join('file://test', '/etc', 'fstab')).toBe('file://test/etc/fstab');
  expect(join('file:///', 'etc', 'fstab')).toBe('file:///etc/fstab');
  expect(join('file:///', 'etc/fstab')).toBe('file:///etc/fstab');
  expect(join('file:', '///etc//fstab')).toBe('file:///etc/fstab');

  expect(() => join('http:')).toThrow();
  expect(join('http:', 'test.domain.com')).toBe('http://test.domain.com');
  expect(join('http:test.domain.com')).toBe('http://test.domain.com');
  expect(join('http://test.domain.com')).toBe('http://test.domain.com');
  expect(join('http://', 'test.domain.com')).toBe('http://test.domain.com');
  expect(join('http:', '//test.domain.com')).toBe('http://test.domain.com');
  expect(join('http://', '//test.domain.com')).toBe('http://test.domain.com');
  expect(join('http:///', 'test.domain.com')).toBe('http://test.domain.com');
  expect(join('http:/', '/test.domain.com')).toBe('http://test.domain.com');
  expect(join('http:', 'test.domain.com', 'api')).toBe('http://test.domain.com/api');

  expect(join('http:', 'localhost:8000')).toBe('http://localhost:8000');
  expect(join('http:localhost:8000')).toBe('http://localhost:8000');
  expect(join('http://localhost:8000')).toBe('http://localhost:8000');
  expect(join('http://', 'localhost:8000')).toBe('http://localhost:8000');
  expect(join('http:', '//localhost:8000')).toBe('http://localhost:8000');
  expect(join('http://', '//localhost:8000')).toBe('http://localhost:8000');
  expect(join('http:///', 'localhost:8000')).toBe('http://localhost:8000');
  expect(join('http:/', '/localhost:8000')).toBe('http://localhost:8000');
  expect(join('http:', 'localhost:8000', 'api')).toBe('http://localhost:8000/api');

  expect(join('a', 'b//c')).toBe('a/b/c');
  expect(join('a', '//b//c')).toBe('a/b/c');
  expect(join('a', 'b//c//')).toBe('a/b/c/');
  expect(join('a', '//b//c//')).toBe('a/b/c/');

  expect(join('////a', 'b//c')).toBe('//a/b/c');
});
