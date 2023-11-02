<div align="center">

# DCANod

[<img src="https://cdn-images-1.medium.com/max/1200/1*QcdyoqNR6wfqR72qWtRk4w.png" width="50" alt="Nexo logo">](https://pro.nexo.io)
[<img src="https://avatars.githubusercontent.com/u/82473144?s=200" width="50" alt="Ghostfolio logo">](https://ghostfol.io)

**Simple Open Source CLI application to DCA with Nexo Pro & Ghostfolio**

![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/aussedatlo/dcanod/master)
[![Shield: Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-orange.svg)](#contributing)
[![Shield: License: AGPL v3](https://img.shields.io/badge/License-MIT-blue.svg)](https://www.gnu.org/licenses/mit)
![GitHub issues](https://img.shields.io/github/issues/aussedatlo/dcanod)
![GitHub pull requests](https://img.shields.io/github/issues-pr/aussedatlo/dcanod)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aussedatlo/dcanod)

</div>

## Intro

DCANod is an easy-to-use and lightweight command-line application built using Node.js and TypeScript.
It offers a hassle-free setup process, allowing users to quickly start performing recurring cryptocurrency purchases on the Nexo Pro exchange.
Additionally, the application seamlessly imports these transactions into their Ghostfolio instance,
providing a smooth and efficient experience for managing their crypto investments.

## Install

```shell
pnpm install
pnpm build
```

## Setup command

To configure DCANod to work with Nexo Pro and Ghostfolio, simply execute:

```shell
dcanod-cli setup
```

```shell
✔ [Nexo] key:  … <nexo-api-key>
✔ [Nexo] secret:  … <nexo-api-secret>
✔ [Ghostfolio] hostname:  … <ghostfolio-hostname>
✔ [Ghostfolio] port:  … <ghostfolio-port>
✔ [Ghostfolio] secret:  … <ghostfolio-secret-token>
✔ [Ghostfolio] (optionnal) account id :  … <account-id>
✔ Configuration saved
```

This will create a `config.json` file in `~/.config/dcanod` by default.
You can use another config file using option `-c`.

```shell
dcanod-cli setup -c /tmp/dcanod/newconfig.json
```

## Buy command

Buy a specific amount of crypto.

```shell
dcanod-cli buy BTC/USDT 15
```

## Automating with Crontab

To automate the execution of DCANod on a recurring schedule, we can use the crontab utility on Unix-like systems.
Crontab allows us to set up scheduled tasks, such as running DCANod at specific intervals.

Edit the crontab file by executing the following command:

```shell
crontab -e
```

To run DCANod every Monday at 8 AM, add the following line to the crontab:

```crontab
0 8 * * 1 dcanod-cli BTC/USDT 20
```

## Tests

```shell
pnpm test
```
