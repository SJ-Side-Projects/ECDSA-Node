import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 as secp } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { HDKey } from "ethereum-cryptography/hdkey.js";
import { getRandomBytesSync } from "ethereum-cryptography/random.js";
import { toHex,hexToBytes } from 'ethereum-cryptography/utils';
import fs from 'fs';

// Should be moved to FE client
function generatePubPrivateKeys() {
  // Create random 32 bytes
  let seed = getRandomBytesSync(32);
  let hdkey = HDKey.fromMasterSeed(seed);
  return {
    publicKey: hdkey.publicKey,
    privateKeyHex: toHex(hdkey.privateKey),
    publicKeyHex: toHex(hdkey.publicKey)
  }
}

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

// Should be moved to FE client
async function signMessage(msg, privateKey) {
  let messageHash = hashMessage(msg)
  console.log(secp.sign(messageHash, privateKey))
  return secp.sign(messageHash, privateKey);
}

function getAddress(publicKey) {
  // cast publicKey to uint8Array
  const kHash = keccak256(publicKey.slice(1))
  console.log(kHash.slice(kHash.length-20))
  return kHash.slice(kHash.length-20)
}

function recoverKey(message, signature, recovery) {
  try{
    let hash = hashMessage(message);
    // create signature from compactHex
    signature = secp.Signature.fromDER(signature);
    console.log(signature)
    signature.recovery = recovery;
    let publicKey = hexToBytes(signature.recoverPublicKey(hash).toHex());
    console.log(`Public Key: ${publicKey}\n`)
    return publicKey
  }catch(err) {
    console.log(err)
    return null
  }
}

function initialiseRecords(number) {
  // check if file exists
  const addressFilePath = `./db/addresses.json`
  const balanceFilePath = `./db/ledger.json`
  if (fs.existsSync(addressFilePath) && fs.existsSync(balanceFilePath)) {
    return
  }
  const records = {};
  const ledger = {};
  for (let i = 0; i < number; i++) {
    let { publicKey, privateKeyHex, publicKeyHex } = generatePubPrivateKeys();
    let address = toHex(getAddress(publicKey));
    records[address] = { 
      privateKey: privateKeyHex, 
      publicKey: publicKeyHex
    };
    ledger[address] = 100; // Initial balance is 100
  }
  fs.writeFileSync(addressFilePath, JSON.stringify(records));
  fs.writeFileSync(balanceFilePath, JSON.stringify(ledger));
  return records;
}

function validateTx(message, signature,recovery) {
  console.log(recovery)
  let publicKey = recoverKey(message, signature, recovery);
  const {sender} = JSON.parse(message);
  let address = toHex(getAddress(publicKey));
  console.log(sender, address)
  if (address.toString()!==sender.toString()){
    return false;
  }
  return true;
}

export { generatePubPrivateKeys, hashMessage, signMessage, getAddress, recoverKey, initialiseRecords, validateTx};
