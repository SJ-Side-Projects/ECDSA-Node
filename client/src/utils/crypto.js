import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 as secp } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";


function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function signTx(transaction, privateKey) {
  let msg = JSON.stringify(transaction);
  console.log(msg)
  let messageHash = hashMessage(msg)
  let signature = secp.sign(messageHash, privateKey)
  const {recovery} = signature;
  console.log(signature);
  return {hex:signature.toDERHex(false), recovery:recovery}; //
}

export {
  signTx
}