import nock from 'nock';
import { Nexus2Client } from '../src/nexus2-client';
import { UploadFile } from '../src/interfaces';
import { STAGING_PROFILES_1 } from './data/mock-data';

describe('nexus2-client tests', () => {
  let client: Nexus2Client;

  beforeEach(() => {
    client = new Nexus2Client({
      url: 'http://localhost:8082/nexus',
      username: 'admin',
      password: 'admin123'
    });
  });

  it('should return found profile id', async () => {
    nock('http://localhost:8082')
      .get('/nexus/service/local/staging/profiles')
      .reply(200, STAGING_PROFILES_1);
    const id = await client.getStagingProfileId('test');
    expect(id).toBe('2e32338b1a152');
  });

  it('should upload file into repository', async () => {
    nock('http://localhost:8082')
      .put('/nexus/service/local/staging/deployByRepositoryId/fake/org%2Fexample/test.txt')
      .reply(201);
    const uploadFile: UploadFile = {
      path: 'test/data/nexus/org/example/test.txt',
      name: 'test.txt',
      group: 'org%2Fexample'
    };
    await client.deployByRepository(uploadFile, 'fake');
  });
});
