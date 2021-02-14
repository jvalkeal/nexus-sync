/**
 * Possible error fields if any. Some responses don't usually return data, but may return error fields.
 */
export interface ErrorResponse {
  errors?: [
    {
      id: string;
      msg: string;
    }
  ];
}

/**
 * When requesting profiles, were interested of id/name pairs.
 */
export interface StagingProfilesResponse extends ErrorResponse {
  data: [
    {
      id: string;
      name: string;
    }
  ];
}

/**
 * Promote start just needs description.
 */
export interface PromoteStartRequest {
  data: {
    description: string;
  };
}

/**
 * Promote start response gives us repo id.
 */
export interface PromoteStartResponse extends ErrorResponse {
  data: {
    description: string;
    stagedRepositoryId: string;
  };
}

/**
 * Closing aka finishing staging repo needs staging repo id, target repo is and optional description.
 */
export interface PromoteFinishRequest {
  data: {
    stagedRepositoryId: string;
    targetRepositoryId?: string;
    description: string;
  };
}

/**
 * Closing aka finishing a staging repo will not return data unless there were errors.
 */
export interface PromoteFinishResponse extends ErrorResponse {}

/**
 * Promote staging repo needs staging repo id, target repo is and optional description.
 */
export interface PromotePromoteRequest {
  data: {
    stagedRepositoryId: string;
    targetRepositoryId?: string;
    description: string;
  };
}

/**
 * Promote a staging repo will not return data unless there were errors.
 */
export interface PromotePromoteResponse extends ErrorResponse {}

/**
 * Drop staging repo needs staging repo id, target repo is and optional description.
 */
export interface PromoteDropRequest {
  data: {
    stagedRepositoryId: string;
    targetRepositoryId?: string;
    description: string;
  };
}

/**
 * Promote a staging repo will not return data unless there were errors.
 */
export interface PromoteDropResponse extends ErrorResponse {}

/**
 * Keep nexus server setting together.
 */
export interface NexusServer {
  url: string;
  username: string;
  password: string;
}

export interface GenerateChecksum {
  type: string;
  extension: string;
}

/**
 * Options for action to ease passing those around.
 */
export interface ActionOptions {
  stagingProfileName: string;
  close: boolean;
  closeTimeout: number;
  release: boolean;
  releaseTimeout: number;
  dir: string;
  nexusServer: NexusServer;
  generateChecksums: boolean;
  generateChecksumsConfig: GenerateChecksum[];
}

export interface Repository {
  type: string;
}

/**
 * Represents a file to get uploaded to a staging repo, where
 * path is a real os path, name as a file name and group is a
 * escaped group id accepted by nexus requests.
 */
export interface UploadFile {
  path: string;
  name: string;
  group: string;
}
