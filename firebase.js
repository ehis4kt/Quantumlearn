console.log("firebase.js loaded");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    setDoc,
    orderBy,
    serverTimestamp
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔥 Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCj1v7IkWDkR4K1zb2Al0WQZNP_327iiFY",
    authDomain: "quantumlearn-e5a1e.firebaseapp.com",
    projectId: "quantumlearn-e5a1e",
    storageBucket: "quantumlearn-e5a1e.appspot.com",
    messagingSenderId: "1084410866448",
    appId: "1:1084410866448:web:9c0e5b2a7c3f1d9e4b6c8",
    measurementId: "G-F196W0S05Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase initialized successfully!");


// ===============================
// 🔐 REGISTER USER
// ===============================
window.registerFirebaseUser = async function (email, password) {

    try {
        const userCredential =
            await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email, nickname: email.split("@")[0], createdAt: serverTimestamp()
        });
        alert("Registration Successful!");

        window.location.href = "auth.html";

    } catch (error) {
        console.log(error.code);
        console.log(error.message);
        alert(error.code + "\n" + error.message);
    }
};


// ===============================
// 🔐 LOGIN USER
// ===============================
window.loginFirebaseUser = async function (email, password) {

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("Login Successful!");

        localStorage.setItem("userEmail", email);

        if (email === "admin@quantumlearn.com") {

            window.location.href = "admin.html";

        } else {

            window.location.href = "dashboard.html";

        }

    } catch (error) {

        alert(error.message);
    }
};


// ===============================
// 🏆 SAVE QUIZ SCORE (LEADERBOARD)
// ===============================
window.saveScoreToFirebase = async function (email, score, level) {
    console.log("saveScoreToFirebase called", email, score, level);

    try {

        await addDoc(collection(db, "leaderboard"), {
            email: email,
            score: score,
            level: level,
            timestamp: serverTimestamp()
        });

        console.log("Score saved to Firebase");

    } catch (error) {

        console.error("Error saving score:", error);
    }
};
// ===============================
// 🏆 LOAD LEADERBOARD
// ===============================

window.loadLeaderboard = async function () {

    const table =
        document.getElementById(
            "leaderboardBody"
        );

    table.innerHTML = "";

    try {

        const q = query(
            collection(db, "leaderboard"),
            orderBy("score", "desc")
        );
        const snapshot = await getDocs(q);

        let counter = 1;

        snapshot.forEach((docSnapshot) => {

            const data =
                docSnapshot.data();
            const nickname = data.email.split("@")[0];
            const displayName = nickname.charAt(0).toUpperCase() + nickname.slice(1);

            const row = `
                <tr class="border-b border-slate-700 text-center">

                    <td class="py-4 text-center">
                        ${counter}
                    </td>

                    <td class="py-4 text-center">
                        ${displayName}
                    </td>

                    <td class="py-4">
                        ${data.score}
                    </td>

                    <td class="py-4 text-center">
                        ${data.level}
                    </td>

                </tr>
            `;

            table.innerHTML += row;

            counter++;
        });

    } catch (error) {

        console.error(
            "Leaderboard Error:",
            error
        );
    }
};
//  ADD QUIZ QUESTION

window.addQuizQuestion = async function () {
    const course = document.getElementById("course").value;

    const question =
        document.getElementById("quizQuestion").value;

    const option1 =
        document.getElementById("option1").value;

    const option2 =
        document.getElementById("option2").value;

    const option3 =
        document.getElementById("option3").value;

    const option4 =
        document.getElementById("option4").value;

    const correctAnswer =
        document.getElementById("correctAnswer").value;

    if (
        !course ||
        !question ||
        !option1 ||
        !option2 ||
        !option3 ||
        !option4 ||
        !correctAnswer
    ) {

        alert("Fill all fields");

        return;
    }

    try {

        await addDoc(
            collection(db, "quizQuestions"),
            {
                course: course,

                question: question,

                options: [
                    option1,
                    option2,
                    option3,
                    option4
                ],

                answer: correctAnswer,

                createdAt: serverTimestamp()
            }
        );

        alert("Quiz question added successfully!");

        document.getElementById("quizQuestion").value = "";
        document.getElementById("option1").value = "";
        document.getElementById("option2").value = "";
        document.getElementById("option3").value = "";
        document.getElementById("option4").value = "";
        document.getElementById("correctAnswer").value = "";

    } catch (error) {

        console.error(error);

        alert("Error adding question");
    }

};
// ===============================
//  LOAD QUIZ QUESTIONS
// ===============================

window.loadQuizQuestions = async function () {

    const quizList =
        document.getElementById("quizList");

    if (!quizList) return;

    quizList.innerHTML = "";

    try {

        const snapshot =
            await getDocs(
                collection(db, "quizQuestions")
            );

        snapshot.forEach((doc) => {

            const data = doc.data();

            quizList.innerHTML += `

            <div class="bg-slate-700 p-5 rounded-lg">

                <h3 class="text-lg font-bold text-green-400">
                    ${data.question}
                </h3>

                <ul class="mt-3 space-y-2">

                    ${data.options.map(option => `
                        <li class="bg-slate-600 p-2 rounded">
                            ${option}
                        </li>
                    `).join("")}

                </ul>

                <p class="mt-3 text-yellow-400">

                    Correct Answer:
                    ${data.answer}

                </p>

            </div>
       ` ;
        });

    } catch (error) {

        console.error(error);
    }

};
window.loadStudentProgress = async function () {

    const email = localStorage.getItem("userEmail");

    if (!email) return;

    const q = query(
        collection(db, "leaderboard"),
        where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    let totalScore = 0;
    let highestScore = 0;
    let quizzesTaken = 0;

    snapshot.forEach((doc) => {

        const data = doc.data();

        quizzesTaken++;

        totalScore += data.score;

        if (data.score > highestScore) {

            highestScore = data.score;
        }

    });

    const average =
        quizzesTaken === 0
            ? 0
            : (totalScore / quizzesTaken).toFixed(1);

    let level = "Beginner";
    let badge = "Quiz Starter";

    if (highestScore >= 30) {

        level = "Advanced";
        badge = "Quiz Master";

    } else if (highestScore >= 20) {

        level = "Intermediate";
        badge = "Smart Learner";
    }

    document.getElementById("totalPoints").innerText = totalScore;
    document.getElementById("quizCount").innerText = quizzesTaken;
    document.getElementById("averageScore").innerText = average;
    document.getElementById("currentLevel").innerText = level;
    document.getElementById("currentBadge").innerText = badge;
};
// ===============================
//  LOGOUT USER
// ===============================

window.logoutUser = async function () {

    try {

        await signOut(auth);

        localStorage.removeItem("userEmail");

        alert("Logged out successfully!");

        window.location.href = "auth.html";

    } catch (error) {

        alert(error.message);

    }

};
// ===============================
//  AUTH GUARD (PROTECT PAGES)
// ===============================
window.checkAuth = function (redirectIfNotLoggedIn = true) {

    onAuthStateChanged(auth, (user) => {

        if (user) {
            console.log("User logged in:", user.email);
        } else {
            console.log("No user found");

            if (redirectIfNotLoggedIn) {
                window.location.href = "auth.html";
            }
        }
    });
};
window.loadAdminAnalytics = async function () {
    console.log("loadAdminAnalytics is running");
    // Load students
    const users = await getDocs(collection(db, "users"));
    console.log("Users:", users.size);

    document.getElementById("totalStudents").textContent =
        users.size;

    // Load leaderboard
    const leaderboard =
        await getDocs(collection(db, "leaderboard"));
    console.log("Leaderboard:", leaderboard.size);

    let highest = 0;
    let total = 0;

    leaderboard.forEach(doc => {

        const data = doc.data();

        total += Number(data.score);

        if (Number(data.score) > highest) {

            highest = Number(data.score);

        }

    });

    document.getElementById("quizAttempts").textContent =
        leaderboard.size;

    document.getElementById("highestScore").textContent =
        highest;

    const average =
        leaderboard.size > 0
            ? Math.round(total / leaderboard.size)
            : 0;

    document.getElementById("averageScoreAdmin").textContent =
        average;

};
window.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("totalStudents")) {

        console.log("Calling Admin Analytics...");

        window.loadAdminAnalytics();

    }

});