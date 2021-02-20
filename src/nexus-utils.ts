import * as core from '@actions/core';
import { Nexus2Client } from './nexus2-client';
import { ActionOptions, PromoteStartRequest } from './interfaces';
import { findFiles, delayPromise } from './utils';

/**
 * Create a staging repo and return its id for furher operations.
 */
export async function createStagingRepo(nexusClient: Nexus2Client, actionOptions: ActionOptions): Promise<string> {
  const stagingProfileId = await nexusClient.getStagingProfileId(actionOptions.stagingProfileName);
  const data: PromoteStartRequest = {
    data: {
      description: 'Create repo'
    }
  };
  const startResponse = await nexusClient.createStagingRepo(stagingProfileId, data);
  core.setOutput('staged-repository-id', startResponse.data.stagedRepositoryId);
  return startResponse.data.stagedRepositoryId;
}

/**
 * Upload all files from a give directory into a staging repository.
 */
export async function uploadFiles(nexusClient: Nexus2Client, dir: string, stagedRepositoryId: string): Promise<void> {
  const files = await findFiles(dir);
  const promises = files.map(f => nexusClient.deployByRepository(f, stagedRepositoryId));
  await Promise.all(promises);
}

/**
 * Close staging repository.
 */
export async function closeStagingRepo(
  nexusClient: Nexus2Client,
  actionOptions: ActionOptions,
  stagedRepositoryId: string
): Promise<void> {
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
export async function releaseStagingRepo(
  nexusClient: Nexus2Client,
  actionOptions: ActionOptions,
  stagedRepositoryId: string
): Promise<void> {
  await nexusClient.bulkPromoteStagingRepos({
    data: {
      description: 'Release repo',
      stagedRepositoryIds: [stagedRepositoryId],
      autoDropAfterRelease: actionOptions.releaseAutoDrop
    }
  });
}

/**
 * Drop staging repository.
 */
export async function dropStagingRepo(nexusClient: Nexus2Client, stagedRepositoryId: string): Promise<void> {
  await nexusClient.dropStagingRepo(stagedRepositoryId, {
    data: {
      description: 'Release repo',
      stagedRepositoryId
    }
  });
}

export async function waitRepoState(
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
