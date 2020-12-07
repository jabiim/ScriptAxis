import {useState, useContext} from 'react'
import Layout from '../components/Layout'
import Head from 'next/head'
import Router from 'next/router'
import firebase from '../utilities/Firebase'
import axios from 'axios'
import UserContext from '../utilities/UserContext'

import style from './signin.module.css'

const SignIn = () => {

    const [error, setError] = useState("");
    const {setUser} = useContext(UserContext);

    const signIn = e => {
        const doSignIn = async (email, password, callback) => {
            setError("");
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = await axios("/api/users/email", {email});
                setUser(user.data)
                console.log("Found user data", user.data);
                window.localStorage.setItem("userdata", JSON.stringify(user.data));
                callback({success: true});
            } catch(error) {
                firebase.auth().signOut();
                window.localStorage.removeItem("userdata");
                console.log(error.message);
                callback({success: false, error: "Incorrect username/password combination"});
            }
        }

        e.preventDefault();

        doSignIn(e.target.email.value, e.target.password.value, result => {
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
                <title>ScriptAxis | Sign In</title>
            </Head>
            <h1>Sign In</h1>
            <form onSubmit={signIn} className={style.signin}>
                <label htmlFor="email">Email</label>
                <input id="email" />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" />
                <input type="submit" value="Sign In" />
                <p style={{color: "red"}}>{error}</p>
            </form>
        </Layout>
    )
}
export default SignIn;