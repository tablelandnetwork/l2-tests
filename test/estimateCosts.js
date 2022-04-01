const sqlite = require("sqlite3");
const getTransactionReceipt = require("./getTransactionReceipt");
// ASSUMPTIONS
const ethPrice = 3500;
const l1gasPrice = 55;
const optimismGasPrice = 0.001;

const arbitrumL1TxFee = 2356.9625176;
const arbitrumGasPrice = 0.010247663;

async function main() {
  const paid = [];

  const db = new sqlite.Database("./test_runs.db");

  await new Promise((resolve, reject) => {
    db.each(
      "SELECT * FROM TransactionLog WHERE network='Optimism' OR network='Arbitrum';",
      async (err, row) => {
        if (err) console.log(err);
        const result = await getTransactionReceipt(
          row.transactionId,
          row.gateway
        );

        let price;

        switch (row.network) {
          case "Optimism":
            price = OptimismCalculation(
              result.l1GasUsed,
              parseInt(result.gasUsed)
            );
            break;
          case "Arbitrum":
            price = ArbitrumCalculation(
              parseInt(result.feeStats.unitsUsed.l1Calldata),
              parseInt(result.gasUsed)
            );
            break;
        }
        paid.push(price.priceInUSD);
        db.run(`UPDATE TransactionLog 
          SET usd_estimate='${price.priceInUSD}'
          WHERE transactionId='${row.transactionId}' 
          ;`);
      }
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

function PriceDenominations(priceInGwei) {
  const priceInEth = priceInGwei / 1000000000;
  const priceInUSD = priceInEth * ethPrice;
  return {
    priceInGwei,
    priceInEth,
    priceInUSD,
  };
}

function OptimismCalculation(l1Fee, l2GasUsed) {
  const priceInGwei = l1Fee * 1.5 * l1gasPrice + l2GasUsed * optimismGasPrice;

  return PriceDenominations(priceInGwei);
}

function ArbitrumCalculation(l1Calldata, gasUsed) {
  console.log(l1Calldata, gasUsed);
  const l1fee = arbitrumL1TxFee + l1Calldata * l1gasPrice;
  console.log("L1 fee: ", l1fee);
  const l2fee = arbitrumGasPrice * gasUsed;
  const priceInGwei = l1fee + l2fee;
  return PriceDenominations(priceInGwei);
}
