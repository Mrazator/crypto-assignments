# Instructions

## Prerequisites

Specific Node version (below) should be the only requirement to run this script, as I already included `node_modules` (so NPM should not be needed).

> **Note**: I was running this on WSL1, with the version of Ubuntu specified below. It might happen that it is not compatible with other platforms, however newer versions of Ubuntu should be ifne.  

### Node version

Node.js with version `v13.12.0`.

### WSL1 specifics

```
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 18.04.4 LTS
Release:        18.04
Codename:       bionic
```

## Execution

In the root of the folder, run following to generate a signature and show the output:

- `node src/index.js public.pem message.txt bad_sig.sha512`

In order verify it, following sequence of commands might come handy:

- `openssl dgst -sha512 -verify public.pem -signature good_sig.sha512 message.txt`
- `node src/index.js public.pem message.txt good_sig.sha512`
