import { buildZip, extractZip } from './archive';

function bytesOf(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function textOf(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

describe('buildZip/extractZip round-trip', () => {
  test('preserves every entry path and content byte-for-byte', () => {
    const entries = [
      { path: 'manifest.json', bytes: bytesOf('{"a":1}') },
      { path: 'data.json', bytes: bytesOf('{"rows":[]}') },
      { path: 'files/abc.jpg', bytes: new Uint8Array([1, 2, 3, 255, 0]) },
    ];
    const zipped = buildZip(entries);
    const { entries: extracted, rejectedPaths } = extractZip(zipped);

    expect(rejectedPaths).toEqual([]);
    expect(extracted).toHaveLength(3);
    const byPath = new Map(extracted.map((e) => [e.path, e.bytes]));
    expect(textOf(byPath.get('manifest.json')!)).toBe('{"a":1}');
    expect(textOf(byPath.get('data.json')!)).toBe('{"rows":[]}');
    expect([...byPath.get('files/abc.jpg')!]).toEqual([1, 2, 3, 255, 0]);
  });

  test('handles an empty archive', () => {
    const zipped = buildZip([]);
    const { entries, rejectedPaths } = extractZip(zipped);
    expect(entries).toEqual([]);
    expect(rejectedPaths).toEqual([]);
  });
});

describe('extractZip — entry-name sanitization (SECURITY.md §5, zip-slip prevention)', () => {
  test('rejects parent-directory traversal', () => {
    const zipped = buildZip([{ path: '../../etc/passwd', bytes: bytesOf('x') }]);
    const { entries, rejectedPaths } = extractZip(zipped);
    expect(entries).toEqual([]);
    expect(rejectedPaths).toEqual(['../../etc/passwd']);
  });

  test('rejects absolute paths', () => {
    const zipped = buildZip([{ path: '/etc/passwd', bytes: bytesOf('x') }]);
    const { rejectedPaths } = extractZip(zipped);
    expect(rejectedPaths).toEqual(['/etc/passwd']);
  });

  test('rejects a traversal segment embedded mid-path', () => {
    const zipped = buildZip([{ path: 'files/../../../secret', bytes: bytesOf('x') }]);
    const { rejectedPaths } = extractZip(zipped);
    expect(rejectedPaths).toEqual(['files/../../../secret']);
  });

  test('accepts ordinary nested paths', () => {
    const zipped = buildZip([{ path: 'files/sub/deep.jpg', bytes: bytesOf('x') }]);
    const { entries, rejectedPaths } = extractZip(zipped);
    expect(rejectedPaths).toEqual([]);
    expect(entries[0]?.path).toBe('files/sub/deep.jpg');
  });
});
