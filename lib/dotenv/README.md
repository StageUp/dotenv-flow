**Fork Note:** This fork uses an alternative parsing function, which adds the following changes:

- `#` (with preceding space) starts a comment anywhere on the line (e.g. `KEY=VALUE # a comment`)
- Quote-enclosed whitespace doesn't get trimmed (e.g. `INDENTED='  retained'`)
- Some additional edge-case tests

AFAIK it passes all existing tests.

---

# dotenv

<img src="https://raw.githubusercontent.com/motdotla/dotenv/master/dotenv.png" alt="dotenv" align="right" />

Dotenv is a zero-dependency module that loads environment variables from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env). Storing configuration in the environment separate from code is based on [The Twelve-Factor App](http://12factor.net/config) methodology.

[![BuildStatus](https://img.shields.io/travis/motdotla/dotenv/master.svg?style=flat-square)](https://travis-ci.org/motdotla/dotenv)
[![NPM version](https://img.shields.io/npm/v/dotenv.svg?style=flat-square)](https://www.npmjs.com/package/dotenv)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Coverage Status](https://img.shields.io/coveralls/motdotla/dotenv/master.svg?style=flat-square)](https://coveralls.io/github/motdotla/dotenv?branch=coverall-intergration)

## Install

```bash
npm install dotenv --save
```

## Usage

As early as possible in your application, require and configure dotenv.

```javascript
require('dotenv').config()
```

Create a `.env` file in the root directory of your project. Add
environment-specific variables on new lines in the form of `NAME=VALUE`.
For example:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

That's it.

`process.env` now has the keys and values you defined in your `.env` file.

```javascript
var db = require('db')
db.connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS
})
```

### Preload

If you are using iojs-v1.6.0 or later, you can use the `--require` (`-r`) command line option to preload dotenv. By doing this, you do not need to require and load dotenv in your application code.


```bash
$ node -r dotenv/config your_script.js
```

The configuration options below are supported as command line arguments in the format `dotenv_config_<option>=value`

```bash
$ node -r dotenv/config your_script.js dotenv_config_path=/custom/path/to/your/env/vars
```

## Config

_Alias: `load`_

`config` will read your .env file, parse the contents, and assign it to
[`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env). You can additionally, pass options to
`config`.

### Options

#### Silent

Default: `false`

Dotenv outputs a warning to your console if missing a `.env` file. Suppress
this warning using silent.

```js
require('dotenv').config({silent: true})
```

#### Path

Default: `.env`

You can specify a custom path if your file containing environment variables is
named or located differently.

```js
require('dotenv').config({path: '/custom/path/to/your/env/vars'})
```

#### Encoding

Default: `utf8`

You may specify the encoding of your file containing environment variables
using this option.

```js
require('dotenv').config({encoding: 'base64'})
```

## Parse

The engine which parses the contents of your file containing environment
variables is available to use. It accepts a String or Buffer and will return
an Object with the parsed keys and values.

```js
var dotenv = require('dotenv')
var buf = new Buffer('BASIC=basic')
var config = dotenv.parse(buf) // will return an object
console.log(typeof config, config) // object { BASIC : 'basic' }
```

### Rules

The parsing engine currently supports the following rules:

- `BASIC=basic` becomes `{BASIC: 'basic'}`
- empty lines are skipped
- empty values become empty strings (`EMPTY=` becomes `{EMPTY: ''}`)
- single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes `{SINGLE_QUOTE: "quoted"}`)
- leading/trailing whitespace gets trimmed, unless within quotes
- new lines are expanded if in double quotes (`MULTILINE="new\nline"` becomes

```
{MULTILINE: 'new
line'}
```
- inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes `{JSON:"{\"foo\": \"bar\"}"`)
- ` #` indicates a comment for the rest of the line unless it's quoted (`HASH='here # there' # a comment` becomes `{HASH: "here # there"}`). lines starting with `#` are entirely skipped.

## FAQ

### Should I commit my `.env` file?

No. We **strongly** recommend against committing your `.env` file to version
control. It should only include environment-specific values such as database
passwords or API keys. Your production database should have a different
password than your development database.

### Should I have multiple `.env` files?

No. We **strongly** recommend against having a "main" `.env` file and an "environment" `.env` file like `.env.test`. Your config should vary between deploys, and you should not be sharing values between environments.

> In a twelve-factor app, env vars are granular controls, each fully orthogonal to other env vars. They are never grouped together as “environments”, but instead are independently managed for each deploy. This is a model that scales up smoothly as the app naturally expands into more deploys over its lifetime.
>
> – [The Twelve-Factor App](http://12factor.net/config)

### What happens to environment variables that were already set?

We will never modify any environment variables that have already been set. In particular, if there is a variable in your `.env` file which collides with one that already exists in your environment, then that variable will be skipped. This behavior allows you to override all `.env` configurations with a machine-specific environment, although it is not recommended.

If you want to override `process.env` you can do something like this:

```javascript
const fs = require('fs')
const dotenv = require('dotenv')
const envConfig = dotenv.parse(fs.readFileSync('.env.override'))
for (var k in envConfig) {
  process.env[k] = envConfig[k]
}
```


### Can I customize/write plugins for dotenv?

For `dotenv@2.x.x`: Yes. `dotenv.config()` now returns an object representing
the parsed `.env` file. This gives you everything you need to continue
setting values on `process.env`. For example:

```js
var dotenv = require('dotenv')
var variableExpansion = require('dotenv-expand')
const myEnv = dotenv.config()
variableExpansion(myEnv)
```

### What about variable expansion?

For `dotenv@2.x.x`: Use [dotenv-expand](https://github.com/motdotla/dotenv-expand).

For `dotenv@1.x.x`: We haven't been presented with a compelling use case for expanding variables and believe it leads to env vars that are not "fully orthogonal" as [The Twelve-Factor App](http://12factor.net/config) outlines.<sup>[[1](https://github.com/motdotla/dotenv/issues/39)][[2](https://github.com/motdotla/dotenv/pull/97)]</sup> Please open an issue if you have a compelling use case.


## Contributing Guide

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Change Log

See [CHANGELOG.md](CHANGELOG.md)

## License

See [LICENSE](LICENSE)

## Who's using dotenv

Here's just a few of many repositories using dotenv:

* [npm](https://github.com/npm/newww)
* [jaws](https://github.com/jaws-framework/jaws-core-js)
* [node-lambda](https://github.com/motdotla/node-lambda)
* [resume-cli](https://www.npmjs.com/package/resume-cli)
* [phant](https://www.npmjs.com/package/phant)
* [adafruit-io-node](https://github.com/adafruit/adafruit-io-node)
* [mockbin](https://www.npmjs.com/package/mockbin)
* [and many more...](https://www.npmjs.com/browse/depended/dotenv)

## Go well with dotenv

Here's some projects that expand on dotenv. Check them out.

* [require-environment-variables](https://github.com/bjoshuanoah/require-environment-variables)
* [dotenv-safe](https://github.com/rolodato/dotenv-safe)
* [envalid](https://github.com/af/envalid)
