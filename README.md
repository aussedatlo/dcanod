# dcanod

```
  ____     ____      _      _   _               _
 |  _ \   / ___|    / \    | \ | |   ___     __| |
 | | | | | |       / _ \   |  \| |  / _ \   / _` |
 | |_| | | |___   / ___ \  | |\  | | (_) | | (_| |
 |____/   \____| /_/   \_\ |_| \_|  \___/   \__,_|
```

Simple cli application to buy crypto on crypto exchange (currently, only Binance is supported)

## Install

```shell
npm install
npm run build
npm install -g
```

## Configuration

To configure DCANod, simply execute:

```shell
dcanod-cli setup
```

You will need to select your platform, then enter api key.
This will create a `config.json` file in `~/.config/dcanod` by default.
You can use another folder using option `-p`.

```shell
dcanod-cli setup -p /tmp/dcanod
```

## Buy

Buy specific ammount of crypto.

```shell
dcanod-cli buy BTCUSDT 15
```

This command will save the order info in a file `orders.json` in config folder.

## Orders

List all orders created.

```shell
dcanod-cli orders
```

```json
{
  orders: [
    {
      pair: ****,
      orderId: ****,
      time: ****,
      price: ****,
      quantity: ****
    }
  ]
}
```

## Stats

Display some stats from previous orders (beta).

```shell
dcanod-cli stats
```

```shell
┌─────────┬─────────────┬───────────────┬──────────────┬─────────┬───────┐
│    pair │ total_spent │ total_ammount │ actual_price │   delta │  gain │
├─────────┼─────────────┼───────────────┼──────────────┼─────────┼───────┤
│ BTCUSDT │       ***** │       ******* │        ***** │ +**** % │ +**** │
└─────────┴─────────────┴───────────────┴──────────────┴─────────┴───────┘
```
