import firebase from "firebase"
import "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyC8hpX9acVZs_r8aObD0GfawKUcpXPJL8w",
    authDomain: "au-debugger-dev.firebaseapp.com",
    databaseURL: "https://au-debugger-dev.firebaseio.com",
    projectId: "au-debugger-dev",
    storageBucket: "au-debugger-dev.appspot.com",
    messagingSenderId: "96933494731",
    appId: "1:96933494731:web:09980d0db3781938be004e",
    measurementId: "G-P4Y9PZ3RXB"
};

firebase.initializeApp(firebaseConfig);

if (globalThis.window) {
    firebase.auth().signInAnonymously();
}

const firestore = firebase.firestore();
const col = firestore.collection("share");

export async function dbSharePacket(name, data, serverbound, type) {
    const ref = await col.add({
        name,
        data,
        serverbound,
        type
    });

    return ref.id;
}

export async function dbGetPacket(id) {
    const snapshot = await col.doc(id).get();

    return snapshot.data();
}