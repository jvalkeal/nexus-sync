import { inspect } from 'util';
import { ActionOptions } from './interfaces';
import { endGroup, logInfo, startGroup } from './logging';
import {
  closeStagingRepo,
  createStagingRepo,
  dropStagingRepo,
  releaseStagingRepo,
  uploadFiles,
  waitRepoState
} from './nexus-utils';
import { Nexus2Client } from './nexus2-client';
import { generateChecksumFiles, generatePgpFiles } from './utils';

export async function handle(actionOptions: ActionOptions): Promise<void> {
  const nexusClient = new Nexus2Client(actionOptions.nexusServer);

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
    await waitRepoState(nexusClient, handlerState.stagingRepoId, 'closed', actionOptions.closeTimeout);
    endGroup();
  }

  // need to release
  if (handlerState.needRelease && handlerState.stagingRepoId) {
    startGroup('Staging Repo Release');
    await releaseStagingRepo(nexusClient, actionOptions, handlerState.stagingRepoId);
    logInfo(`Released repo ${handlerState.stagingRepoId}`);
    logInfo(`Waiting repo ${handlerState.stagingRepoId} state released`);
    await waitRepoState(nexusClient, handlerState.stagingRepoId, 'released', actionOptions.closeTimeout);
    endGroup();
  }

  // drop if needed
  if (handlerState.needDrop && handlerState.stagingRepoId) {
    startGroup('Staging Repo Drop');
    await dropStagingRepo(nexusClient, handlerState.stagingRepoId);
    logInfo(`Dropped repo ${handlerState.stagingRepoId}`);
    endGroup();
  }
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
