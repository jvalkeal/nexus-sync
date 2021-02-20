import * as core from '@actions/core';
import { inspect } from 'util';
import { handle } from './handler';
import { ActionOptions, GenerateChecksum } from './interfaces';
import { numberValue } from './utils';

async function run() {
  try {
    core.startGroup('Nexus Sync');
    const username = inputRequired('username');
    const password = inputRequired('password');
    const create = inputNotRequired('create') === 'true' ? true : false;
    const stagingProfileName = inputRequired('staging-profile-name');
    const stagingRepoId = inputNotRequired('staging-repo-id') || undefined;
    const upload = inputNotRequired('upload') === 'true' ? true : false;
    const close = inputNotRequired('close') === 'true' ? true : false;
    const dropIfFailure = inputNotRequired('drop-if-failure') === 'true' ? true : false;
    const closeTimeout = numberValue(inputNotRequired('close-timeout'), 10);
    const release = inputNotRequired('release') === 'true' ? true : false;
    const releaseTimeout = numberValue(inputNotRequired('release-timeout'), 10);
    const url = inputNotRequired('url') || 'http://localhost:8082/nexus';
    const dir = inputNotRequired('dir') || 'nexus';
    const generateChecksums = inputNotRequired('generate-checksums') === 'true' ? true : false;
    const generateChecksumsConfigData = inputNotRequired('generate-checksums-config') || '[]';
    const generateChecksumsConfig: GenerateChecksum[] = JSON.parse(generateChecksumsConfigData);
    const pgpSign = inputNotRequired('pgp-sign') === 'true' ? true : false;
    const pgpSignPrivateKey = inputNotRequired('pgp-sign-private-key');
    const pgpSignPassphrase = inputNotRequired('pgp-sign-passphrase');
    const actionOptions: ActionOptions = {
      create,
      stagingProfileName,
      stagingRepoId,
      upload,
      close,
      closeTimeout,
      dropIfFailure,
      release,
      releaseTimeout,
      dir,
      nexusServer: {
        username,
        password,
        url
      },
      generateChecksums,
      generateChecksumsConfig,
      gpgSign: pgpSign,
      gpgSignPassphrase: pgpSignPassphrase,
      gpgSignPrivateKey: pgpSignPrivateKey
    };
    await handle(actionOptions);
    core.endGroup();
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

function inputRequired(id: string): string {
  return core.getInput(id, { required: true });
}

function inputNotRequired(id: string): string {
  return core.getInput(id, { required: false });
}

run();
