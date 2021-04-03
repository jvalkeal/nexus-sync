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
| `close-timeout`             | How long in seconds to wait slow nexus close operation, defaults to "600"                          | Optional |
| `release`                   | Automatically release repository, defaults to "false".                                             | Optional |
| `release-auto-drop`         | Drop repo after release, defaults to "true".                                                       | Optional |
| `release-timeout`           | How long in seconds to wait slow nexus release operation, defaults to "600"                        | Optional |
| `generate-checksums`        | Generate checksums, defaults to "false"                                                            | Optional |
| `generate-checksums-config` | Config to generate checksum files.                                                                 | Optional |
| `pgp-sign`                  | Sign files, defaults to "false"                                                                    | Optional |
| `pgp-sign-private-key`      | PGP private key as ascii armored                                                                   | Optional |
| `pgp-sign-passphrase`       | PGP private key passphrase                                                                         | Optional |
| `url`                       | Base Nexus url, defaults to "https://oss.sonatype.org"                                             | Optional |
| `upload`                    | Upload files, defaults to "false".                                                                 | Optional |
| `upload-parallel`           | How many files are uploaded parallel, defaults to "1"                                              | Optional |
| `nexus-timeout`             | How long in seconds to wait http requests to nexus, defaults to "0" meaning no timeout             | Optional |

# Usage

See [action.yml](action.yml)

On default this action really does nothing unless needed configs are
in place.

This normal example of an action does:
- Takes everything under base directory _nexus_
- PGP sign files
- Create _md5_ and _sha_ checksums
- Creates a stating repo
- Uploads everything under _nexus_ into newly create stating repo
- Closes it and wait closed state
- Releases it and wait a proper state
- After all this, you should have artifacts released

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
        pgp-sign: true
        pgp-sign-passphrase: ${{ secrets.GPG_PASSPHRASE }}
        pgp-sign-private-key: ${{ secrets.GPG_PRIVATE_KEY }}
```

There are more detailed docs and samples under [docs](docs) directory.

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
