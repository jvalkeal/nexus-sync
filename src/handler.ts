import { inspect } from 'util';
import { ActionOptions } from './interfaces';
import { logInfo } from './logging';
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
    logInfo('PGP sign files');
    await generatePgpFiles(actionOptions.dir, actionOptions.gpgSignPrivateKey, actionOptions.gpgSignPassphrase);
  }

  // need to checksum
  if (handlerState.needChecksum) {
    logInfo(`Generating checksum files with config ${inspect(actionOptions.generateChecksumsConfig)}`);
    await generateChecksumFiles(actionOptions.dir, actionOptions.generateChecksumsConfig);
  }

  // if there's a need to create a repo
  if (handlerState.needCreate) {
    logInfo('Creating staging repo');
    const stagedRepositoryId = await createStagingRepo(nexusClient, actionOptions);
    handlerState.stagingRepoId = stagedRepositoryId;
    logInfo(`Created staging repo ${stagedRepositoryId}`);
  }

  // need to upload files
  if (handlerState.needUpload && handlerState.stagingRepoId) {
    logInfo('Uploading files');
    await uploadFiles(nexusClient, actionOptions.dir, handlerState.stagingRepoId);
  }

  // need to close
  if (handlerState.needClose && handlerState.stagingRepoId) {
    logInfo(`Closing staging repo ${handlerState.stagingRepoId}`);
    await closeStagingRepo(nexusClient, actionOptions, handlerState.stagingRepoId);
    logInfo(`Closed staging repo ${handlerState.stagingRepoId}`);
    logInfo(`Waiting repo ${handlerState.stagingRepoId} state closed`);
    await waitRepoState(nexusClient, handlerState.stagingRepoId, 'closed', actionOptions.closeTimeout);
  }

  // need to release
  if (handlerState.needRelease && handlerState.stagingRepoId) {
    logInfo(`Releasing staging repo ${handlerState.stagingRepoId}`);
    await releaseStagingRepo(nexusClient, actionOptions, handlerState.stagingRepoId);
    logInfo(`Released staging repo ${handlerState.stagingRepoId}`);
    logInfo(`Waiting repo ${handlerState.stagingRepoId} state released`);
    await waitRepoState(nexusClient, handlerState.stagingRepoId, 'released', actionOptions.closeTimeout);
  }

  // drop if needed
  if (handlerState.needDrop && handlerState.stagingRepoId) {
    logInfo(`Dropping repo ${handlerState.stagingRepoId}`);
    await dropStagingRepo(nexusClient, handlerState.stagingRepoId);
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
