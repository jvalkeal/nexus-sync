export const STAGING_PROFILES_1 = `
{
  "data": [
    {
      "autoStagingDisabled": false,
      "closeRuleSets": [],
      "deployURI": "http://localhost:8082/nexus/service/local/staging/deploy/maven2",
      "dropNotifyCreator": true,
      "dropNotifyRoles": [],
      "finishNotifyCreator": true,
      "finishNotifyRoles": [],
      "id": "2e32338b1a152",
      "inProgress": false,
      "mode": "BOTH",
      "name": "test",
      "order": 0,
      "promoteRuleSets": [],
      "promotionNotifyCreator": true,
      "promotionNotifyRoles": [],
      "promotionTargetRepository": "releases",
      "properties": {
        "@class": "linked-hash-map"
      },
      "repositoriesSearchable": true,
      "repositoryTargetId": "1",
      "repositoryTemplateId": "default_hosted_release",
      "repositoryType": "maven2",
      "resourceURI": "http://localhost:8082/nexus/service/local/staging/profiles/2e32338b1a152",
      "targetGroups": [
        "public"
      ]
    }
  ]
}
`;

export const STAGING_START_1 =
`
{
  "data": {
    "description": "test",
    "stagedRepositoryId": "test-1004"
  }
}
`;
