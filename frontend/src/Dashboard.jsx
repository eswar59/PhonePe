import { useEffect, useState } from "react"
import { Appbar } from "../components/AppBar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import { useSearchParams } from "react-router-dom"
import axios from "axios"

export const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const name = searchParams.get("name");

    const [balance, setBalance] = useState(0); // create balance state so that it updates
    //setBalance(searchParams.get("balance"));
    // get the balance from BE every time this componet reloads
    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token") 
            }
        })
        .then(res => {
            setBalance(res.data.balance)
        })            
    }, [])
    
    


    return <div>
        <Appbar name={name} />
        <div className="m-8">
            <Balance value={balance} />
            <Users />
        </div>
    </div>
}