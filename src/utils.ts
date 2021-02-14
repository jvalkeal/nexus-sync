import fs from 'fs';
import glob from 'glob';
import path from 'path';
import crypto, { getHashes } from 'crypto';
import { GenerateChecksum, UploadFile } from './interfaces';
import { logInfo } from './logging';
import { has } from 'lodash';
import { stringify } from 'querystring';

/**
 * Find files from a base directory to get uploaded by automatically
 * giving correct structure ready for api requests.
 *
 * @param baseDir base directory for uploaded files structure
 */
export async function findFiles(baseDir: string): Promise<UploadFile[]> {
  return new Promise((resolve, reject) => {
    glob(baseDir + '/**/!(*.asc)', (error, files) => {
      if (error) {
        reject(error);
        return;
      }
      let found: UploadFile[] = [];
      const regex = /\//gi;
      files.forEach(f => {
        const stat = fs.lstatSync(f);
        if (stat.isFile()) {
          found.push({
            path: f,
            name: path.basename(f),
            group: path.relative(baseDir, path.dirname(f)).replace(regex, '%2F')
          });
          logInfo(`Found ${f}`);
        }
      });
      resolve(found);
    });
  });
}

export async function createCheckSums(path: string, config: GenerateChecksum[]): Promise<Map<string, string>> {
  return new Promise<Map<string, string>>((resolve, reject) => {
    const stat = fs.lstatSync(path);
    if (stat.isFile()) {
      const hashes = new Map<string, crypto.Hash>();
      config.forEach(c => {
        const hash = crypto.createHash(c.type);
        hashes.set(c.type, hash);
      });
      const stream = fs.createReadStream(path);
      stream.on('data', data => {
        for (const hash of hashes.values()) {
          hash.update(data, 'utf8');
        }
      });
      stream.on('end', () => {
        const digests = new Map<string, string>();
        hashes.forEach((hash, type) => {
          const digest = hash.digest('hex');
          digests.set(type, digest);
        });
        resolve(digests);
      });
    } else {
      reject(`${path} is not a file`);
    }
  });
}

export async function generateChecksumFiles(baseDir: string, config: GenerateChecksum[]): Promise<void> {
  return new Promise((resolve, reject) => {
    glob(baseDir + '/**/!(*.asc)', (error, files) => {
      if (error) {
        reject(error);
        return;
      }
      let all: Promise<void>[] = [];
      files.forEach(path => {
        const stat = fs.lstatSync(path);
        if (stat.isFile()) {
          const p = createCheckSums(path, config).then(res => {
            res.forEach((digest, type) => {
              const dpath = `${path}.${type}`;
              fs.writeFileSync(dpath, digest);
            });
          });
          all.push(p);
        }
      });
      resolve(Promise.all(all).then());
    });
  });
}

/**
 * Returns value or default and handles if value is "falsy".
 */
export function numberValue(value: number | string | undefined, defaultValue: number): number {
  let v: number | undefined;
  if (typeof value === 'string') {
    if (value.length > 0) {
      const v = parseInt(value, 10);
      if (isNaN(v)) {
        throw new Error(`Can't parse '${value}' as number`);
      }
    }
  } else {
    v = value;
  }

  if (v === 0) {
    return v;
  }
  return v || defaultValue;
}

/**
 * Returns a simple promise with delay timeout.
 */
export function delayPromise(millis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, millis));
}
