## Step 1, get testnet funds


## Step 2, deploy contract

You can do this on your own if you like. At the moment, we already have 
a contract deployed and they are in the test file.

## Step 2, run transactions


```
npm install
npx hardhat test
node test/estimateCosts.js
```
Then open of the test_runs.db (an SQLite database) to view the results. The simplest way I’ve seen to the this is using this app: https://sqliteviewer.app/

The attached file is the result of a few rounds of my own testing. Feel free to open it using the above app and look into. 
