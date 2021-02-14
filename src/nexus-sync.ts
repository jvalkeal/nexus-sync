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
    const stagingProfileName = inputRequired('staging-profile-name');
    const close = inputNotRequired('close') === 'false' ? false : true;
    const closeTimeout = numberValue(inputNotRequired('close-timeout'), 10);
    const release = inputNotRequired('release') === 'false' ? false : true;
    const releaseTimeout = numberValue(inputNotRequired('release-timeout'), 10);
    const url = inputNotRequired('url') || 'http://localhost:8082/nexus';
    const dir = inputNotRequired('dir') || 'nexus';
    const generateChecksums = inputNotRequired('generate-checksums') === 'true' ? true : false;
    const generateChecksumsConfigData = inputNotRequired('generate-checksums-config') || '[]';
    const generateChecksumsConfig: GenerateChecksum[] = JSON.parse(generateChecksumsConfigData);
    const actionOptions: ActionOptions = {
      stagingProfileName,
      close,
      closeTimeout,
      release,
      releaseTimeout,
      dir,
      nexusServer: {
        username,
        password,
        url
      },
      generateChecksums,
      generateChecksumsConfig
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
