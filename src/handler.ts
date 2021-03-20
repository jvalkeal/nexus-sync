import { inspect } from 'util';
import { ActionOptions } from './interfaces';
import { endGroup, logDebug, logInfo, logWarn, startGroup } from './logging';
import {
  closeStagingRepo,
  createStagingRepo,
  dropStagingRepo,
  releaseStagingRepo,
  uploadFiles,
  waitRepoState,
  stagingRepositoryActivity
} from './nexus-utils';
import { Nexus2Client } from './nexus2-client';
import { generateChecksumFiles, generatePgpFiles } from './utils';

export async function handle(actionOptions: ActionOptions): Promise<void> {
  const nexusClient = new Nexus2Client(actionOptions.nexusServer);
  logDebug(`Using nexus server ${actionOptions.nexusServer.url}`);

  // initial state calculated from a given options
  const handlerState: HandlerState = {
    needSign: actionOptions.gpgSign,
    needChecksum: actionOptions.generateChecksums,
    needCreate: actionOptions.create,
    stagingRepoId: actionOptions.stagingRepoId,
    needUpload: actionOptions.upload,
    needClose: actionOptions.close,
    needRelease: actionOptions.release,
    needDrop: actionOptions.dropIfFailure
  };

  // need to sign
  if (handlerState.needSign) {
    startGroup('PGP Sign');
    logInfo('Signing files');
    await generatePgpFiles(actionOptions.dir, actionOptions.gpgSignPrivateKey, actionOptions.gpgSignPassphrase);
    endGroup();
  }

  // need to checksum
  if (handlerState.needChecksum) {
    startGroup('Checksums');
    logInfo(`Generation with config ${inspect(actionOptions.generateChecksumsConfig)}`);
    await generateChecksumFiles(actionOptions.dir, actionOptions.generateChecksumsConfig);
    endGroup();
  }

  // if there's a need to create a repo
  if (handlerState.needCreate) {
    startGroup('Staging Repo Create');
    const stagedRepositoryId = await createStagingRepo(nexusClient, actionOptions);
    handlerState.stagingRepoId = stagedRepositoryId;
    logInfo(`Created repo ${stagedRepositoryId}`);
    endGroup();
  }

  // need to upload files
  if (handlerState.needUpload && handlerState.stagingRepoId) {
    startGroup('File Upload');
    await uploadFiles(nexusClient, actionOptions.dir, handlerState.stagingRepoId);
    endGroup();
  }

  // need to close
  if (handlerState.needClose && handlerState.stagingRepoId) {
    startGroup('Staging Repo Close');
    await closeStagingRepo(nexusClient, actionOptions, handlerState.stagingRepoId);
    logInfo(`Closed repo ${handlerState.stagingRepoId}`);
    logInfo(`Waiting repo ${handlerState.stagingRepoId} state closed`);
    try {
      await waitRepoState(nexusClient, handlerState.stagingRepoId, 'closed', actionOptions.closeTimeout);
    } catch (error) {
      await logActivity(nexusClient, handlerState.stagingRepoId);
      if (handlerState.needDrop) {
        await dropRepo(nexusClient, handlerState.stagingRepoId);
      }
      throw error;
    }
    endGroup();
  }

  // need to release
  if (handlerState.needRelease && handlerState.stagingRepoId) {
    startGroup('Staging Repo Release');
    await releaseStagingRepo(nexusClient, actionOptions, handlerState.stagingRepoId);
    logInfo(`Released repo ${handlerState.stagingRepoId}`);
    logInfo(`Waiting repo ${handlerState.stagingRepoId} state released`);
    try {
      await waitRepoState(nexusClient, handlerState.stagingRepoId, 'released', actionOptions.releaseTimeout);
    } catch (error) {
      await logActivity(nexusClient, handlerState.stagingRepoId);
      throw error;
    }
    endGroup();
  }
}

async function logActivity(nexusClient: Nexus2Client, stagingRepoId: string): Promise<void> {
  try {
    const activities = await stagingRepositoryActivity(nexusClient, stagingRepoId);
    logWarn(`Repo activities ${inspect(activities, false, 10)}`);
  } catch (error) {}
}

async function dropRepo(nexusClient: Nexus2Client, stagingRepoId: string): Promise<void> {
  try {
    logInfo(`Dropping repo ${stagingRepoId}`);
    await dropStagingRepo(nexusClient, stagingRepoId);
  } catch (error) {}
}

interface HandlerState {
  needSign: boolean;
  needChecksum: boolean;
  needCreate: boolean;
  stagingRepoId: string | undefined;
  needUpload: boolean;
  needClose: boolean;
  needRelease: boolean;
  needDrop: boolean;
}
