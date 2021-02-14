import nock from 'nock';
import { handle } from '../src/handler';
import { Nexus2Client } from '../src/nexus2-client';
import { ActionOptions } from '../src/interfaces';
import { STAGING_PROFILES_1 } from './data/mock-data';

describe('handler tests', () => {
  beforeEach(() => {});

  it('should close and release successfully', async () => {
    const options: ActionOptions = {
      close: true,
      closeTimeout: 10,
      release: true,
      releaseTimeout: 10,
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      stagingProfileName: 'test',
      generateChecksums: false,
      generateChecksumsConfig: []
    };
  });
});
