import {useState, useContext} from 'react'
import Layout from '../components/Layout'
import Head from 'next/head'
import Router from 'next/router'
import firebase from '../utilities/Firebase'
import axios from 'axios'
import UserContext from '../utilities/UserContext'

import style from './signin.module.css'

const SignUp = () => {

    const [error, setError] = useState("");
    const {setUser} = useContext(UserContext);

    const signUp = e => {
        const doSignUp = async (email, username, password, callback) => {
            setError("");
            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log(firebase.auth().currentUser);
                firebase.auth().currentUser.sendEmailVerification();
                const user = await axios.post("/api/users/create", {email, username});
                setUser(user.data)
                console.log("Found user data", user.data);
                window.localStorage.setItem("userdata", JSON.stringify(user.data));
                callback({success: true});
            } catch(error) {
                firebase.auth().signOut();
                window.localStorage.removeItem("userdata");
                console.log(error.message);
                callback({success: false, error: error.message});
            }
        }

        e.preventDefault();

        if(e.target.password.value !== e.target.confirm.value) {
            setError("Passwords don't match!");
            return;
        }

        doSignUp(e.target.email.value, e.target.username.value, e.target.password.value, result => {
            if(result.success) {
                Router.push("/");
            } else {
                setError(result.error);
            }
        })
    }

    return (
        <Layout>
            <Head>
                <title>ScriptAxis | Sign Up</title>
            </Head>
            <h1>Sign In</h1>
            <form onSubmit={signUp} className={style.signin}>
                <label htmlFor="email">Email (not displayed publicly)</label>
                <input id="email" />
                <label htmlFor="username">Username</label>
                <input id="username" />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" />
                <label htmlFor="confirm">Confirm Password</label>
                <input type="password" id="confirm" />
                <input type="submit" value="Sign Up" />
                <p style={{color: "red"}}>{error}</p>
            </form>
        </Layout>
    )
}
export default SignUp;