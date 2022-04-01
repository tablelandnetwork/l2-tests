const sqlite = require("sqlite3");

async function main() {
  const paid = [];

  const fetch = await import("node-fetch");

  const db = new sqlite.Database("./test_runs.db");

  await new Promise((resolve, reject) => {
    db.each(
      "SELECT * FROM TransactionLog WHERE network='Optimism';",
      async (err, row) => {
        if (err) console.log(err);
        const myHeaders = new fetch.Headers();
        myHeaders.append("Content-Type", "application/json");
        console.log(row.transactionId);

        const raw = JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [row.transactionId],
          id: 1,
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        const receipt = await fetch
          .default("https://kovan.optimism.io", requestOptions)
          .then((response) => response.json())
          .catch((error) => console.log("error", error));
        const result = receipt.result;

        const price = LogPrice(result.l1GasUsed, parseInt(result.gasUsed), 55);
        paid.push(price.priceInUSD);
      },
      () => {}
    );

    setTimeout(() => {
      resolve();
    }, 3000);
    // If the above looks hackey to you, it is.
  });

  function getAvg(grades) {
    const total = grades.reduce((acc, c) => acc + c, 0);
    return total / grades.length;
  }
  console.log(`Average cost: ${getAvg(paid)}`);
}
main();

function calcPrice(l1Fee, l2GasUsed, mainnetGasPrice, l2GasPrice) {
  const priceInGwei = l1Fee * 1.5 * mainnetGasPrice + l2GasUsed * l2GasPrice;
  const priceInEth = priceInGwei / 1000000000;
  const priceInUSD = priceInEth * 3000;

  return {
    priceInGwei,
    priceInEth,
    priceInUSD,
  };
}

function LogPrice(l1Fee, l2GasUsed, mainnetGasPrice) {
  const l2GasPrice = 0.001;
  l1Fee = parseInt(l1Fee);
  const price = calcPrice(l1Fee, l2GasUsed, mainnetGasPrice, l2GasPrice);
  console.log(`
  USD for this transaction: ${price.priceInUSD}

  Transaction: 

  Assertions: 
  L1 gas used: ${l1Fee}
  L2 gas price: ${l2GasPrice}
  L2 gas used: ${l2GasUsed}
  
  Assumptions: 
  Eth is at $3,000 USD
  Gas on eth is at 55 gwei
  Gas on optimism is .001 gwei
  `);
  return price;
}
