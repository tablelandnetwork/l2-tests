import sqlite from "sqlite3";

const db = new sqlite.Database("./test_runs.db");

db.run(
  `CREATE TABLE IF NOT EXISTS TransactionLog 
    (
      id integer primary key, 
      transactionId text,
      network text, 
      contract text, 
      gateway text, 
      testedAt integer,
      timeToConfirm integer,       
      result text,
      usd_estimate text
    );
  `
);

interface Network {
  name: string;
  overrides?: any;
  contract: string;
  rpc: string;
}

function logTransaction(data: {
  network: Network;
  duration: number;
  testDate: number;
  transactionId: string;
  result: string;
}) {
  const statement = `INSERT INTO TransactionLog 
    (
      transactionId, 
      network, 
      contract, 
      gateway, 
      testedAt,
      timeToConfirm,
      result
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )`;
  // console.log(statement);
  const prepped = db.prepare(statement);
  prepped.run(
    data.transactionId,
    data.network.name,
    data.network.contract,
    data.network.rpc,
    data.testDate,
    data.duration,
    data.result
  );
}

export default logTransaction;
