import * as core from '@actions/core';
import * as github from '@actions/github';
import { inspect } from 'util';
import { ActionOptions, PromoteStartRequest } from './interfaces';
import { logDebug, logInfo } from './logging';
import { Nexus2Client } from './nexus2-client';
import { findFiles, delayPromise, generateChecksumFiles } from './utils';

/**
 * Main nexus sync handler. Essentialy logic is:
 * 1. Create a new staging repo
 * 2. Upload files into it
 * 3.1. Close and Release repo if instructed
 * 3.2  Skip Close and Release if not needed
 * 4. If errors occur, choose if not to drop to let user investigate
 */
export async function handle(actionOptions: ActionOptions): Promise<void> {

  logDebug(`Handling with options ${inspect(actionOptions)}`);
  const nexusClient = new Nexus2Client(actionOptions.nexusServer);
  core.debug(`github context: ${inspect(github.context, true, 10)}`);

  if (actionOptions.generateChecksums) {
    logInfo(`Generating checksum files with config ${inspect(actionOptions.generateChecksumsConfig)}`);
    await generateChecksumFiles(actionOptions.dir, actionOptions.generateChecksumsConfig);
  }

  // 1. Create Staging repo
  logInfo('Creating staging repo');
  const stagedRepositoryId = await createStagingRepo(nexusClient, actionOptions);
  logInfo(`Created staging repo ${stagedRepositoryId}`);

  // 2. Upload files into staging repo
  logInfo('Uploading files');
  await uploadFiles(nexusClient, actionOptions.dir, stagedRepositoryId);

  // 3. we can close as soon as files are uploaded
  let closeRequested = false;
  if (actionOptions.close) {
    logInfo(`Closing staging repo ${stagedRepositoryId}`);
    await closeStagingRepo(nexusClient, actionOptions, stagedRepositoryId);
    logInfo(`Closed staging repo ${stagedRepositoryId}`);
    closeRequested = true;
  }

  // 4. wait for close
  //    we use conservative timeout not to eat minutes,
  //    one could always run further release separately
  let closeComplete = false;
  if (closeRequested) {
    logInfo(`Waiting repo ${stagedRepositoryId} state closed`);
    await waitRepoState(nexusClient, stagedRepositoryId, 'closed', actionOptions.closeTimeout);
    closeComplete = true;
  }

  // 5. we can release if it's in a correct state
  //    repository need to be in a correct state before release can happen
  //    action also support to run release as a separete step, thus we check
  //    from description to find current open repo
  let releaseRequested = false;
  if (actionOptions.release && closeRequested) {
    logInfo(`Releasing repo ${stagedRepositoryId}`);
    await releaseStagingRepo(nexusClient, actionOptions, stagedRepositoryId);
    logInfo(`Released repo ${stagedRepositoryId}`);
    releaseRequested = true;
  }

  // 6. wait for release
  //    we use conservative timeout not to eat minutes,
  //    one could always check things manually if release timeouts
  let releaseComplete = false;
  if (releaseRequested) {
    logInfo(`Waiting repo ${stagedRepositoryId} state released`);
    await waitRepoState(nexusClient, stagedRepositoryId, 'released', actionOptions.releaseTimeout);
    releaseComplete = true;
  }

  // 7. drop if needed
  //    really need to drop only if close or release failed
  if (closeComplete && releaseComplete) {
    logInfo(`Dropping repo ${stagedRepositoryId}`);
    await dropStagingRepo(nexusClient, stagedRepositoryId);
  }
}

/**
 * Represents a state where we are.
 */
enum HandlerState {
  Unknown = 'Unknown',
  Open = 'Open',
  Uploaded = 'Uploaded',
  Closed = 'Closed',
  Released = 'Released'
}

/**
 * Create a staging repo and return its id for furher operations.
 */
async function createStagingRepo(nexusClient: Nexus2Client, actionOptions: ActionOptions): Promise<string> {
  const stagingProfileId = await nexusClient.getStagingProfileId(actionOptions.stagingProfileName);
  const data: PromoteStartRequest = {
    data: {
      description: 'Create repo'
    }
  };
  const startResponse = await nexusClient.createStagingRepo(stagingProfileId, data);
  return startResponse.data.stagedRepositoryId;
}

/**
 * Upload all files from a give directory into a staging repository.
 */
async function uploadFiles(nexusClient: Nexus2Client, dir: string, stagedRepositoryId: string): Promise<void> {
  const files = await findFiles(dir);
  const promises = files.map(f => nexusClient.deployByRepository(f, stagedRepositoryId));
  await Promise.all(promises);
}

/**
 * Close staging repository.
 */
async function closeStagingRepo(nexusClient: Nexus2Client, actionOptions: ActionOptions, stagedRepositoryId: string): Promise<void> {
  const stagingProfileId = await nexusClient.getStagingProfileId(actionOptions.stagingProfileName);
  await nexusClient.closeStagingRepo(stagingProfileId, {
    data: {
      description: 'Close repo',
      stagedRepositoryId
    }
  });
}

/**
 * Release staging repository.
 */
async function releaseStagingRepo(nexusClient: Nexus2Client, actionOptions: ActionOptions, stagedRepositoryId: string): Promise<void> {
  const stagingProfileId = await nexusClient.getStagingProfileId(actionOptions.stagingProfileName);
  await nexusClient.promoteStagingRepo(stagingProfileId, {
    data: {
      description: 'Release repo',
      stagedRepositoryId,
      targetRepositoryId: 'releases'
    }
  });
}

/**
 * Drop staging repository.
 */
async function dropStagingRepo(nexusClient: Nexus2Client, stagedRepositoryId: string): Promise<void> {
  await nexusClient.dropStagingRepo(stagedRepositoryId, {
    data: {
      description: 'Release repo',
      stagedRepositoryId
    }
  });
}

async function waitRepoState(
  nexusClient: Nexus2Client,
  repositoryIdKey: string,
  state: string,
  timeout: number
): Promise<void> {
  let now = Date.now();
  const until = now + timeout * 1000;

  while (until > now) {
    const repository = await nexusClient.stagingRepository(repositoryIdKey);
    if (repository.type === state) {
      return;
    }
    await delayPromise(10000);
    now = Date.now();
  }
}
