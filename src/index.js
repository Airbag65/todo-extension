import { initializeApp } from "firebase/app";
import { getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    setDoc,
    updateDoc
} from "firebase/firestore";
import { GoogleAuthProvider, 
    signInWithPopup, 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDSIIAbXu_RkRRyzcBDvJZttLZN8QUWkgk",
    authDomain: "todo-ext-a6fc3.firebaseapp.com",
    projectId: "todo-ext-a6fc3",
    storageBucket: "todo-ext-a6fc3.appspot.com",
    messagingSenderId: "1043030956171",
    appId: "1:1043030956171:web:f190e81c2e32faca925c8e",
    measurementId: "G-QMRKP41BZK"
};

initializeApp(firebaseConfig);

const db = getFirestore();
const provider = new GoogleAuthProvider();
const auth = getAuth();

const getRef = collection(db, "tasks");

let loggedIn = window.sessionStorage.getItem("loggedIn");

const taskIds = new Array();


let userUID = "";

if(typeof loggedIn === "undefined" || loggedIn === null){
    window.sessionStorage.setItem("loggedIn", false);
    window.location.href = "./login.html";
    //let loggedIn = false;
}else{
    userUID = window.sessionStorage.getItem("userUID");
    console.log(userUID, loggedIn);
    try{
        fetchDB();
        // console.log(entries);
        // addItems(entries);
    }catch(e){
        console.log(e.message);
    }
    
}


try{
    const addItemForm = document.querySelector(".new-task-form") ?? null;
    addItemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // let ref = collection(db, "tasks")
        let data = {
            userID: userUID,
            task: addItemForm.newTask.value,
            isDone: false
        }
        addDoc(getRef, data).then((e) => {
            addItemForm.reset();
            fetchDB();
            // if(!taskIds.includes({id: e.id})){
            //     taskIds.push({id: e.id});
            // }
        });
        
    });
    
}catch(e){
    console.log(e.message)
}


try{
    const signUpForm = document.querySelector(".signup-form") ?? null;
    const signUpErrorMessage = document.querySelector(".signup-error");
    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault()
        if(signUpForm.password.value != signUpForm.repPassword.value) {
            signUpErrorMessage.innerHTML = "Passwords don't match!"
            return;
        }
        createUserWithEmailAndPassword(auth, signUpForm.email.value, signUpForm.password.value)
            .then((cred) => {
                console.log(`Created user: ${cred.user.email}`);
                userUID = cred.user.uid;
                signUpForm.reset();
                window.location.href = "./login.html";
            }).catch((error) => {
                console.log(error.message);
                signUpErrorMessage.innerHTML = "Something went wrong!";
            });
    });
    
}
catch(e){
    console.log(e.message)
}


try{
    const loginForm = document.querySelector(".login-form");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let email = loginForm.email.value;
        let password = loginForm.password.value;
        signInWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                console.log(`Logged in user: ${cred.user.email}`)
                userUID = cred.user.uid;
                loginForm.reset();
                window.sessionStorage.setItem("loggedIn", true);
                window.sessionStorage.setItem("userUID", cred.user.uid);
                window.location.href = "./index.html";
            }).catch((error) => {
                console.log(error.message);
            });
    });
}catch(e){
    console.log(e.message)
}


try{
    const logoutButton = document.querySelector(".logout");
    logoutButton.addEventListener("click", (e) => {
        window.sessionStorage.clear();
        location.reload();
    })
}catch(e){
    console.log(e.message)
}

try{
    const deleteFinishedButton = document.querySelector(".del-finished");
    deleteFinishedButton.addEventListener("click", (e) => {
        // let list = fetchDB();
        // console.log(list);
        deleteFinished();
    });
}catch(e){
    console.log(e.message)
}

// ! FUNCTIONS START HERE

function fetchDB(){
    getDocs(getRef)
    .then((snapshot) => {
        const entries = []
        snapshot.docs.forEach((doc) => {
            if (doc.data()["userID"] == userUID){
                entries.push({...doc.data(), id: doc.id});
                //taskIds.push({id: doc.id});
            }
        })
        console.log(entries);
        addItems(entries);
        // return entries;
    })
    .catch(err => {
        console.log(err.message);
    });
}


function addItems(items){
    try{
        const itemsList = document.querySelector(".tasks");
        const doneTasksList = document.querySelector(".done-tasks");
        let notDoneTasks = "";
        let doneTasks = "";
        items.forEach((item) => {
            if(item.isDone){
                doneTasks += `<li class="checked-box box">${item.task} 
                <input type="checkbox" class="checkbox" id="${item.id}" checked>
                </li>`;
            }else {
                notDoneTasks += `<li class="box">${item.task} 
                <input type="checkbox" class="checkbox" id="${item.id}">
                </li>`;
            }
            
        });
        
        itemsList.innerHTML = notDoneTasks;
        doneTasksList.innerHTML = doneTasks;
        updateStatus(items);
    }catch(e){
        console.log(e.message);
    } 
}


function updateStatus(list){
    list.forEach((entry) => {
        let id = entry.id;
        document.getElementById(id).addEventListener("click", async () => {
            console.log("click")
            let updateRef = doc(db, "tasks", id);
            await updateDoc(updateRef, {
                isDone: true
            });
            location.reload();
        });
    });    
}

function deleteFinished(){
    getDocs(getRef)
    .then((snapshot) => {
        const entries_ = []
        snapshot.docs.forEach((doc) => {
            if (doc.data()["userID"] == userUID){
                entries_.push({...doc.data(), id: doc.id});
            }
        })
        delDone(entries_);
    });
}

function delDone(items){
    items.forEach( async (entry) => {
        if (entry.isDone){
            const delRef = doc(db, "tasks", entry.id);
            await deleteDoc(delRef).then(() => {
                location.reload();
            });
        }
    })
}