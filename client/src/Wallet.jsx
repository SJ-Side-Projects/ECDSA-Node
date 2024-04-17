import {useEffect, useState} from 'react';
import server from "./server";

function Wallet({ address, setAddress, balance, setBalance }) {
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    getAddresses();
  },[])

  async function getAddresses() {
    const { data } = await server.get(`addresses`);
    setAddresses(data);
  }

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        {/* <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input> */}
        <select onChange={onChange} value={address}>
          <option value="">Select an address</option>
          {addresses.map((address, index) => (
            <option key={index} value={address}>
              {address}
            </option>
          ))}
        </select>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
