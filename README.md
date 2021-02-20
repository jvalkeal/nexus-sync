# Nexus Sync Action

<p align="left">
  <a href="https://github.com/jvalkeal/nexus-sync"><img alt="Nexus Sync status" src="https://github.com/jvalkeal/nexus-sync/workflows/Test/badge.svg"></a>
</p>

**NOTE:** Work in progress to overcome bintray sunset

### Arguments

| Input                       | Description                                                                                        | Usage    |
| --------------------------- | ---------------------------------------------------------------------------------------------------| -------- |
| `username`                  | Nexus username                                                                                     | Required |
| `password`                  | Nexus password                                                                                     | Required |
| `staging-profile-name`      | Nexus Staging Profile Name                                                                         | Required |
| `dir`                       | Base directory for files to sync, defaults to "nexus"                                              | Optional |
| `create`                    | Automatically create repository, defaults to "false"                                               | Optional |
| `staging-repo-id`           | Nexus Staging Repo id                                                                              | Optional |
| `close`                     | Automatically close repository, defaults to "false".                                               | Optional |
| `drop-if-failure`           | Automatically drop repository, defaults to "false".                                                | Optional |
| `close-timeout`             | How long to wait before bailing out to wait slow nexus close operation, defaults to "10 minutes"   | Optional |
| `release`                   | Automatically release repository, defaults to "false".                                             | Optional |
| `release-auto-drop`         | Drop repo after release, defaults to "true".                                                       | Optional |
| `release-timeout`           | How long to wait before bailing out to wait slow nexus release operation, defaults to "10 minutes" | Optional |
| `generate-checksums`        | Generate checksums, defaults to "false"                                                            | Optional |
| `generate-checksums-config` | Config to generate checksum files.                                                                 | Optional |
| `pgp-sign`                  | Sign files, defaults to "false"                                                                    | Optional |
| `pgp-sign-private-key`      | PGP private key as ascii armored                                                                   | Optional |
| `pgp-sign-passphrase`       | PGP private key passphrase                                                                         | Optional |
| `url`                       | Base Nexus url, defaults to "http://localhost:8082/nexus"                                          | Optional |
| `upload`                    | Upload files, defaults to "false".                                                                 | Optional |

# Usage

See [action.yml](action.yml)

Basic:

```yaml
name: Sync
on:
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    - uses: jvalkeal/nexus-sync@main
      with:
        username: ${{ secrets.NEXUS_USERNAME }}
        password: ${{ secrets.NEXUS_PASSWORD }}
        staging-profile-name: test
        create: true
        upload: true
        close: true
        release: true
        generate-checksums: true
        generate-checksums-config: >
          [
            { "type": "md5", "extension": "md5" },
            { "type": "sha1", "extension": "sha1" }
          ]
        pgp-sign: true
        pgp-sign-passphrase: ${{ secrets.GPG_PASSPHRASE }}
        pgp-sign-private-key: ${{ secrets.GPG_PRIVATE_KEY }}
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
