import { useState } from "react"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export const Signup = () => {
    const [username, setUsername] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <Heading label={"Sign up"} />
                <SubHeading label={"Enter your infromation to create an account"} />
                <InputBox onChange={function (e) {
                    console.log(e.target.value);
                    setFirstname(e.target.value);
                } } placeholder="John" label={"First Name"} />
                <InputBox onChange={function (e) {
                    console.log(e.target.value);
                    setLastname(e.target.value);
                }} placeholder="Doe" label={"Last Name"} />                    
                <InputBox onChange={function (e) {
                    console.log(e.target.value);
                    setUsername(e.target.value);
                }} placeholder="harkirat@gmail.com" label={"Email"} />
                <InputBox onChange={function (e) {
                    console.log(e.target.value);
                    setPassword(e.target.value);
                }} placeholder="123456" label={"Password"} />
                <div className="pt-4">
                    <Button onClick={async function () {
                        const res = await axios.post("http://localhost:3000/api/v1/user/signup", {
                            username,
                            password,
                            firstname,
                            lastname
                        });
                        console.log("abc") // not executed if above res is error
                        console.log(res.data);                        
                        localStorage.setItem("token", res.data.token);  
                        navigate("/dashboard?name=" + res.data.name);                      
                    }} label={"Sign up"} />
                </div>
                <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
            </div>
        </div>
    </div>
}