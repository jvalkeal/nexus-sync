import fs from 'fs';
import { findFiles, generateChecksumFiles, createCheckSums } from '../src/utils';

describe('utils.ts', () => {

  function deleteFile(path: string) {
    try {
      fs.unlinkSync(path);
    } catch (error) {
    }
  }

  function deleteFiles() {
    deleteFile('test/data/nexus/org/example/test.txt.md5');
    deleteFile('test/data/nexus/org/example/test.txt.sha1');
    deleteFile('test/data/nexus/org/example/test.txt.sha256');
    deleteFile('test/data/nexus/org/example/test.txt.sha512');
  }

  afterEach(() => {
    deleteFiles();
  });

  it('should resolve correct files', async () => {
    const uploadFiles = await findFiles('test/data/nexus');
    expect(uploadFiles.length).toBe(1);
    expect(uploadFiles[0].name).toBe('test.txt');
    expect(uploadFiles[0].group).toBe('org%2Fexample');
  });

  it('should create checksums', async () => {
    const checksums = await createCheckSums('test/data/nexus/org/example/test.txt', [
      { type: 'md5', extension: 'md5' },
      { type: 'sha1', extension: 'sha1' },
      { type: 'sha256', extension: 'sha256' },
      { type: 'sha512', extension: 'sha512' }
    ]);
    expect(checksums.size).toBe(4);
    expect(checksums.get('md5')).toBe('9a0364b9e99bb480dd25e1f0284c8555');
    expect(checksums.get('sha1')).toBe('040f06fd774092478d450774f5ba30c5da78acc8');
    expect(checksums.get('sha256')).toBe('ed7002b439e9ac845f22357d822bac1444730fbdb6016d3ec9432297b9ec9f73');
    expect(checksums.get('sha512')).toBe('b2d1d285b5199c85f988d03649c37e44fd3dde01e5d69c50fef90651962f48110e9340b60d49a479c4c0b53f5f07d690686dd87d2481937a512e8b85ee7c617f');
  });

  it('should generate checksum files', async () => {
    await generateChecksumFiles('test/data/nexus', [
      { type: 'md5', extension: 'md5' },
      { type: 'sha1', extension: 'sha1' },
      { type: 'sha256', extension: 'sha256' },
      { type: 'sha512', extension: 'sha512' }
    ]);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.asc.md5')).toBe(false);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.asc.sha1')).toBe(false);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.asc.sha256')).toBe(false);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.asc.sha512')).toBe(false);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.md5')).toBe(true);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.sha1')).toBe(true);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.sha256')).toBe(true);
    expect(fs.existsSync('test/data/nexus/org/example/test.txt.sha512')).toBe(true);
  });
});
