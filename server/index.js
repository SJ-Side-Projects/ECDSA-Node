import { initialiseRecords, validateTx } from "./utils/helper.js";
import express from "express";
import cors from "cors";
import fs from 'fs';

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

var balances = {};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { transaction , signature , recovery} = req.body;
  console.log(req.body)
  
  if (!signature || recovery===undefined) {
    res.status(400).send({ message: "Valid Signature is required!" });
    return
  }

  const { amount, sender, recipient } = JSON.parse(transaction);
  if (!amount || !sender || !recipient) {
    res.status(400).send({ message: "Invalid transaction!" });
    return
  }

  if (!validateTx(transaction,signature,recovery)) {
    res.status(400).send({ message: "Invalid signature!" });
    return
  }

  if (!Object.keys(balances).includes(sender) || !Object.keys(balances).includes(recipient) ) {
    res.status(400).send({ message: "Invalid sender or recipient!" });
    return
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.get("/addresses", (req, res)=>{
  res.send(Object.keys(balances));
})

app.listen(port, () => {
  // Initialise records
  initialiseRecords(10);
  // Load the records
  balances = JSON.parse(fs.readFileSync(`./db/ledger.json`));
  console.log(`Records loaded: ${JSON.stringify(balances)}`);
  console.log(`Listening on port ${port}!`);
});
