import { handle } from '../src/handler';
import { ActionOptions } from '../src/interfaces';
import * as nexusUtils from '../src/nexus-utils';
import * as utils from '../src/utils';

describe('handler tests', () => {
  let createStagingRepoSpy: jest.SpyInstance<Promise<string>>;
  let uploadFilesSpy: jest.SpyInstance<Promise<void>>;
  let closeStagingRepoSpy: jest.SpyInstance<Promise<void>>;
  let releaseStagingRepoSpy: jest.SpyInstance<Promise<void>>;
  let dropStagingRepoSpy: jest.SpyInstance<Promise<void>>;
  let waitRepoStateSpy: jest.SpyInstance<Promise<void>>;

  let generatePgpFilesSpy: jest.SpyInstance<Promise<void>>;
  let generateChecksumFilesSpy: jest.SpyInstance<Promise<void>>;

  beforeEach(() => {
    createStagingRepoSpy = jest.spyOn(nexusUtils, 'createStagingRepo').mockImplementation(() => {
      return Promise.resolve('test-123');
    });
    uploadFilesSpy = jest.spyOn(nexusUtils, 'uploadFiles').mockImplementation(() => {
      return Promise.resolve();
    });
    closeStagingRepoSpy = jest.spyOn(nexusUtils, 'closeStagingRepo').mockImplementation(() => {
      return Promise.resolve();
    });
    releaseStagingRepoSpy = jest.spyOn(nexusUtils, 'releaseStagingRepo').mockImplementation(() => {
      return Promise.resolve();
    });
    dropStagingRepoSpy = jest.spyOn(nexusUtils, 'dropStagingRepo').mockImplementation(() => {
      return Promise.resolve();
    });
    waitRepoStateSpy = jest.spyOn(nexusUtils, 'waitRepoState').mockImplementation(() => {
      return Promise.resolve();
    });
    generatePgpFilesSpy = jest.spyOn(utils, 'generatePgpFiles').mockImplementation(() => {
      return Promise.resolve();
    });
    generateChecksumFilesSpy = jest.spyOn(utils, 'generateChecksumFiles').mockImplementation(() => {
      return Promise.resolve();
    });
  });

  it('should do nothing', async () => {
    const options: ActionOptions = {
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      upload: false,
      create: false,
      close: false,
      release: false,
      releaseAutoDrop: true,
      closeTimeout: 10,
      releaseTimeout: 10,
      dropIfFailure: false,
      stagingProfileName: 'test',
      stagingRepoId: undefined,
      generateChecksums: false,
      generateChecksumsConfig: [],
      gpgSign: false,
      gpgSignPassphrase: '',
      gpgSignPrivateKey: ''
    };
    await handle(options);
    expect(createStagingRepoSpy).not.toHaveBeenCalled();
    expect(uploadFilesSpy).not.toHaveBeenCalled();
    expect(closeStagingRepoSpy).not.toHaveBeenCalled();
    expect(releaseStagingRepoSpy).not.toHaveBeenCalled();
    expect(dropStagingRepoSpy).not.toHaveBeenCalled();
    expect(waitRepoStateSpy).not.toHaveBeenCalled();
    expect(generatePgpFilesSpy).not.toHaveBeenCalled();
    expect(generateChecksumFilesSpy).not.toHaveBeenCalled();
  });

  it('should create staging repo only', async () => {
    const options: ActionOptions = {
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      upload: false,
      create: true,
      close: false,
      release: false,
      releaseAutoDrop: true,
      closeTimeout: 10,
      releaseTimeout: 10,
      dropIfFailure: false,
      stagingProfileName: 'test',
      stagingRepoId: undefined,
      generateChecksums: false,
      generateChecksumsConfig: [],
      gpgSign: false,
      gpgSignPassphrase: '',
      gpgSignPrivateKey: ''
    };
    await handle(options);
    expect(createStagingRepoSpy).toHaveBeenCalled();
    expect(uploadFilesSpy).not.toHaveBeenCalled();
    expect(closeStagingRepoSpy).not.toHaveBeenCalled();
    expect(releaseStagingRepoSpy).not.toHaveBeenCalled();
    expect(dropStagingRepoSpy).not.toHaveBeenCalled();
    expect(waitRepoStateSpy).not.toHaveBeenCalled();
    expect(generatePgpFilesSpy).not.toHaveBeenCalled();
    expect(generateChecksumFilesSpy).not.toHaveBeenCalled();
  });

  it('should create signatures only', async () => {
    const options: ActionOptions = {
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      upload: false,
      create: false,
      close: false,
      release: false,
      releaseAutoDrop: true,
      closeTimeout: 10,
      releaseTimeout: 10,
      dropIfFailure: false,
      stagingProfileName: 'test',
      stagingRepoId: undefined,
      generateChecksums: false,
      generateChecksumsConfig: [],
      gpgSign: true,
      gpgSignPassphrase: '',
      gpgSignPrivateKey: ''
    };
    await handle(options);
    expect(createStagingRepoSpy).not.toHaveBeenCalled();
    expect(uploadFilesSpy).not.toHaveBeenCalled();
    expect(closeStagingRepoSpy).not.toHaveBeenCalled();
    expect(releaseStagingRepoSpy).not.toHaveBeenCalled();
    expect(dropStagingRepoSpy).not.toHaveBeenCalled();
    expect(waitRepoStateSpy).not.toHaveBeenCalled();
    expect(generatePgpFilesSpy).toHaveBeenCalled();
    expect(generateChecksumFilesSpy).not.toHaveBeenCalled();
  });

  it('should create checksums only', async () => {
    const options: ActionOptions = {
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      upload: false,
      create: false,
      close: false,
      release: false,
      releaseAutoDrop: true,
      closeTimeout: 10,
      releaseTimeout: 10,
      dropIfFailure: false,
      stagingProfileName: 'test',
      stagingRepoId: undefined,
      generateChecksums: true,
      generateChecksumsConfig: [],
      gpgSign: false,
      gpgSignPassphrase: '',
      gpgSignPrivateKey: ''
    };
    await handle(options);
    expect(createStagingRepoSpy).not.toHaveBeenCalled();
    expect(uploadFilesSpy).not.toHaveBeenCalled();
    expect(closeStagingRepoSpy).not.toHaveBeenCalled();
    expect(releaseStagingRepoSpy).not.toHaveBeenCalled();
    expect(dropStagingRepoSpy).not.toHaveBeenCalled();
    expect(waitRepoStateSpy).not.toHaveBeenCalled();
    expect(generatePgpFilesSpy).not.toHaveBeenCalled();
    expect(generateChecksumFilesSpy).toHaveBeenCalled();
  });

  it('should close only', async () => {
    const options: ActionOptions = {
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      upload: false,
      create: false,
      close: true,
      release: false,
      releaseAutoDrop: true,
      closeTimeout: 10,
      releaseTimeout: 10,
      dropIfFailure: false,
      stagingProfileName: 'test',
      stagingRepoId: 'test-123',
      generateChecksums: false,
      generateChecksumsConfig: [],
      gpgSign: false,
      gpgSignPassphrase: '',
      gpgSignPrivateKey: ''
    };
    await handle(options);
    expect(createStagingRepoSpy).not.toHaveBeenCalled();
    expect(uploadFilesSpy).not.toHaveBeenCalled();
    expect(closeStagingRepoSpy).toHaveBeenCalled();
    expect(releaseStagingRepoSpy).not.toHaveBeenCalled();
    expect(dropStagingRepoSpy).not.toHaveBeenCalled();
    expect(waitRepoStateSpy).toHaveBeenCalled();
    expect(generatePgpFilesSpy).not.toHaveBeenCalled();
    expect(generateChecksumFilesSpy).not.toHaveBeenCalled();
  });

  it('should release only', async () => {
    const options: ActionOptions = {
      dir: 'test',
      nexusServer: {
        username: 'admin',
        password: 'admin123',
        url: 'http://localhost'
      },
      upload: false,
      create: false,
      close: false,
      release: true,
      releaseAutoDrop: true,
      closeTimeout: 10,
      releaseTimeout: 10,
      dropIfFailure: false,
      stagingProfileName: 'test',
      stagingRepoId: 'test-123',
      generateChecksums: false,
      generateChecksumsConfig: [],
      gpgSign: false,
      gpgSignPassphrase: '',
      gpgSignPrivateKey: ''
    };
    await handle(options);
    expect(createStagingRepoSpy).not.toHaveBeenCalled();
    expect(uploadFilesSpy).not.toHaveBeenCalled();
    expect(closeStagingRepoSpy).not.toHaveBeenCalled();
    expect(releaseStagingRepoSpy).toHaveBeenCalled();
    expect(dropStagingRepoSpy).not.toHaveBeenCalled();
    expect(waitRepoStateSpy).toHaveBeenCalled();
    expect(generatePgpFilesSpy).not.toHaveBeenCalled();
    expect(generateChecksumFilesSpy).not.toHaveBeenCalled();
  });
});
