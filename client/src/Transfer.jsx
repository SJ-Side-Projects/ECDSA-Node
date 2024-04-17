import { useState, useEffect } from "react";
import { signTx } from "./utils/crypto";
import server from "./server";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientAddresses, setRecipientAddresses] = useState([]);
  const [privateKey, setPrivateKey] = useState("");
  const [signature, setSignature] = useState({});

  useEffect(() => {
    getAddresses();
  }, []);

  async function getAddresses() {
    const { data } = await server.get(`addresses`);
    setRecipientAddresses(data);
  }


  const setValue = (setter) => (evt) => setter(evt.target.value);
  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        transaction: JSON.stringify({
          sender: address,
          amount: parseInt(sendAmount),
          recipient,
        }),
        signature: signature.hex,
        recovery: Number(signature.recovery)
      })
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  function sign() {
    try{
      let {hex, recovery} = signTx({sender: address, amount: parseInt(sendAmount), recipient}, privateKey)
      console.log(hex)
      console.log(recovery)
      setSignature({
        hex:hex, 
        recovery:recovery
      })
    }catch(e){
      alert(e)
    }
  }

  return (
    <>
      <form className="container transfer" onSubmit={transfer}>
        <h1>Send Transaction</h1>

        <label>
          Send Amount
          <input
            placeholder="1, 2, 3..."
            value={sendAmount}
            onChange={setValue(setSendAmount)}
          ></input>
        </label>

        <label>
          Recipient
          {/* Drop down */}
          <select
            onChange={setValue(setRecipient)}
          >
            {recipientAddresses.map((address) => (
              <option key={address} value={address}>
                {address}
              </option>
            ))}
          </select>
        </label>
        {
          Object.keys(signature).length && signature.hex?
          <input type="submit" className="button" value="Transfer" />
          : null
        }
      </form>
      <div>
        <label>
          <strong><p>Enter your private key to sign your transaction:</p></strong>
          <i>Don't worry, your private key will not be sent</i>
          <input type="text" 
            onChange={(e)=>setPrivateKey(e.target.value)}
          /> 
          {privateKey? <p>Private key entered</p>: <p>Enter your private key</p>}
        </label>
        <button
          onClick={sign}
        >
          Sign Transaction
        </button>
        <p>Signature:</p>
        {
          Object.keys(signature).length && signature.hex? 
          <p>{signature.hex}</p>:
          <p>Sign your transaction</p>
        }
        
      </div>
    </>
  );
}

export default Transfer;
