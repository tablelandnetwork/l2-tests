module.exports = async function GetTransactionReceipt(transactionId, rpc) {
  const fetch = await import("node-fetch");

  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getTransactionReceipt",
    params: [transactionId],
    id: 1,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const receipt = await fetch
    .default(rpc, requestOptions)
    .then((response) => response.json())
    .catch((error) => console.log("error", error));
  const result = receipt.result;
  return result;
};
