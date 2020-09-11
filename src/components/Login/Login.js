import React, { useState, useContext } from 'react';
import * as firebase from "firebase/app"
import "firebase/auth";
import firebaseConfig from './firebase.config'
import {  UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router-dom';

firebase.initializeApp(firebaseConfig ) 
  
function Login() {
  const [newUser,setNewUser] = useState(false)
  const [user, setUser] = useState({
        isSignedIn : false,
        name :'',
        email:'',
        password :'',
        photo:''                                                                                                                                                          
  });

const [loggedInUser, setLoggedInUser] = useContext(UserContext);
const history  = useHistory();
const location = useLocation();
let { from } = location.state || { from: { pathname: "/" } };

const googleprovider = new firebase.auth.GoogleAuthProvider();
var fbProvider = new firebase.auth.FacebookAuthProvider();
const handleSignIn = () =>{
  firebase.auth().signInWithPopup(googleprovider)
  .then(res =>{
    const {displayName, photoURL,email} = res.user;
    const signedInUser = {
      isSignedIn : true,
      name : displayName,
      email: email,
      photo : photoURL
    }
    setUser(signedInUser)
    
  })

  .catch(err =>{
    console.log(err);
    console.log(err.massage)
  })

}
const handleFBLogin = () => {
  firebase.auth().signInWithPopup(fbProvider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
const handleSignOut = () => {
  firebase.auth().signOut()
  .then(res => {
    const SignedOutuser = {
      isSignedIn : false,
      name :'',
      email:'',
      photo:'' ,
      error : ''  ,
      success : false 
    }
    setUser(SignedOutuser);
  })
  .catch(err => {
    
  });
}

const handleBlur = (e) =>{
  let isFieldValid = true

if(e.target.name === "email"){
   isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
 
}
if(e.target.name === "password"){
  const isPasswordValid = e.target.value.length > 6;
  const passwordHasNumber = /\d{1}/.test(e.target.value)
 isFieldValid = isPasswordValid && passwordHasNumber

}
if(isFieldValid){
  const newUserInfo = {...user}
  newUserInfo[e.target.name] = e.target.value;
  setUser(newUserInfo);
}
}

const handleSubmit =  (e) => {
  // console.log(user.name,user.password)
  if(newUser && user.email && user.password){
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
    .then(res => {
      const newUserInfo = {...user};
      newUserInfo.error = '';
      newUserInfo.success = true
      setUser(newUserInfo);
      updateUserName(user.name);
    })
    .catch(error => {
      // Handle Errors here.
     const newUserInfo = {...user};
     newUserInfo.error = error.message;
     newUserInfo.success = false;
     setUser(newUserInfo)
      
    });
  }

  if(!newUser && user.email && user.password){
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then(res =>{
    const newUserInfo = {...user};
    newUserInfo.error = '';
    newUserInfo.success = true
    setUser(newUserInfo)
    setLoggedInUser(newUserInfo)
    history.replace(from);
    console.log('sign in user info', res.user);
  })
  .catch(function(error) {
    const newUserInfo = {...user};
    newUserInfo.error = error.message;
    newUserInfo.success = false;
    setUser(newUserInfo)
  });
}

e.preventDefault()
}

const updateUserName = name =>{
  const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
     console.log("user name update successfully")
    }).catch(function(error) {
     console.log(error)
    });
}

  return (
    <div style = {{textAlign :'center'}}>
      {user.isSignedIn ?  <button onClick = {handleSignOut}>Sign out</button> :
     <button onClick = {handleSignIn}>Sign in</button>
      }
      <br/>
      <button onClick = {handleFBLogin}>Sign in using facebook</button>
     {
       user.isSignedIn && <div>
        <p>Welcome,{user.name}</p>
        <p>Your email : {user.email}</p>
        <img src={user.photo} alt=""/>

         </div>
     }

     <h1>Our own Authentication</h1>
     <input type="checkbox" onChange = {() => setNewUser(!newUser)} name="newUser" id=""/>
     <label htmlFor="newUser">New User sign up</label>
     
     <form onSubmit={handleSubmit}>
       {newUser && <input name = "name" type="text" onBlur= {handleBlur} placeholder = "your name" />}
       <br/>
     <input type="text" name= "email" onBlur= {handleBlur} placeholder = "Your email address" required/>
     <br/>
     <input type="password" name="password" onBlur= {handleBlur} placeholder = 'Your password' required/>
     <br/>
     <input type="submit" value={newUser ? 'Sign up' :'Sign in'}/>
     </form>
     <p style = {{color : 'red'}}>{user.error}</p>
    {user.success && <p style = {{color : 'green'}}>User {newUser ? 'created' : 'Logged in'} successfully</p>}
    </div>
  );
}

export default Login;
