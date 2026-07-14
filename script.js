// ================= LOGIN =================
import {
    collection,
    getDocs,
    query,
    where
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";


// ================= LOGIN =================

window.loginUser = function () {

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    if (!email || !password) {

        alert("Fill all fields");
        return;
    }

    window.loginFirebaseUser(email, password);
};


// ================= REGISTER =================

window.registerUser = function () {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert("Fill all fields");
        return;
    }

    window.registerFirebaseUser(email, password);
};



// ================= QUIZ =================

if (document.getElementById("question")) {

    let quiz = [];
    let current = 0;
    let score = 0;
    let answered = false;

    let timeLeft = 30;
    let timer = null;
    const q =
        document.getElementById("question");

    const options =
        document.querySelectorAll(".option");
        console.log(options.length);

    const scoreElement =
        document.getElementById("score");

    const levelElement =
        document.getElementById("level");

    const badgeElement =
        document.getElementById("badge");


    // ================= LOAD QUESTIONS =================

    async function fetchQuizQuestions() {

        try {

            const course =
                document.body.dataset.course;

            console.log("Current Course:", course);

            const qy = query(
                collection(db, "quizQuestions"),
                where("course", "==", course)
            );

            const snapshot =
                await getDocs(qy);

            quiz = [];

            snapshot.forEach((doc) => {

                quiz.push(doc.data());
            });

            console.log("Quiz Questions:", quiz);

            if (quiz.length > 0) {

                load();

            } else {

                q.innerText =
                    "No questions available for this course.";
            }

        } catch (error) {

            console.error(error);
        }
    }
    function startTimer() {

        clearInterval(timer);

        timeLeft = 30;
        const timerElement = document.getElementById("timer");
        if (!timerElement) return;
        timerElement.textContent = timeLeft;

        timer = setInterval(() => {

            timeLeft--;

            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {

                clearInterval(timer);

                alert("Time is up!");

                nextQuestion();

            }

        }, 1000);

    }

    // ================= LOAD QUESTION =================

    function load() {
        answered = false;

        const data = quiz[current];

        q.innerText = data.question;
        const totalQuestions = quiz.length;

        const percentage =
            Math.round(((current + 1) / totalQuestions) * 100);

        document.getElementById("questionNumber").textContent =
            `Question ${ current + 1 } of ${ totalQuestions }`;

        document.getElementById("progressPercent").textContent =
            percentage + "%";

        document.getElementById("progressBar").style.width =
            percentage + "%";
        startTimer();

        options.forEach((btn, i) => {

            btn.innerText = data.options[i];
            btn.disabled = false;

            btn.classList.remove(
                "bg-green-600",
                "bg-red-600"
            );
        });
    }


    // ================= CHECK ANSWER =================

    window.checkAnswer = function (btn) {
        if (answered) return;
        answered = true;
        clearInterval(timer);

        const answer = btn.innerText;

        if (answer === quiz[current].answer) {

            score += 1;

            scoreElement.innerText = score;

            updateGamification();

            btn.classList.add("bg-green-600");

        } else {

            btn.classList.add("bg-red-600");
        }
        options.forEach(button => {
    button.disabled = true;
    button.classList.add("opacity-60");
});
    };


    // ================= NEXT QUESTION =================

    window.nextQuestion = async function () {
        clearInterval(timer);

        current++;

        if (current < quiz.length) {

            load();

        } else {

            const level =
                score >= 15 ? "Advanced" :
                    score >= 8 ? "Intermediate" :
                        "Beginner";

            const email =
                localStorage.getItem("userEmail")
                || "anonymous";

            await window.saveScoreToFirebase(
                email,
                score,
                level
            );

           let badge = "Quiz Starter";

if (level === "Intermediate")
    badge = "Smart Learner";

if (level === "Advanced")
    badge = "Quiz Master";

localStorage.setItem("resultScore", score);
localStorage.setItem("resultLevel", level);
localStorage.setItem("resultBadge", badge);

window.location.href = "result.html";
        }
    };


    // ================= GAMIFICATION =================

    function updateGamification() {

        if (score >= 15) {

            levelElement.innerText =
                "Advanced";

            badgeElement.innerText =
                "Quiz Master";

        } else if (score >= 8) {

            levelElement.innerText =
                "Intermediate";

            badgeElement.innerText =
                "Smart Learner";

        } else {

            levelElement.innerText =
                "Beginner";

            badgeElement.innerText =
                "Quiz Starter";
        }
    }


    // START

    fetchQuizQuestions();
}

// ==================================
// SHOW LOGGED-IN STUDENT
// ==================================

const email = localStorage.getItem("userEmail");

if (email) {

    const studentEmail = document.getElementById("studentEmail");
    const studentName = document.getElementById("studentName");

    if (studentEmail && studentName) {

        studentEmail.textContent = email;

        const name = email.split("@")[0];

        studentName.textContent =
            name.charAt(0).toUpperCase() + name.slice(1);
    }

}
// ==================================
// LOAD STUDENT PROGRESS
// ==================================

window.loadStudentProgress = async function () {

    const email = localStorage.getItem("userEmail");

    if (!email) return;

    const snapshot = await getDocs(

        query(
            collection(db, "leaderboard"),
            where("email", "==", email)
        )

    );

    let totalPoints = 0;
    let quizzesTaken = 0;

    snapshot.forEach((doc) => {

        const data = doc.data();

        totalPoints += Number(data.score);

        quizzesTaken++;

    });

    const averageScore =
        quizzesTaken > 0
            ? Math.round(totalPoints / quizzesTaken)
            : 0;

    let level = "Beginner";
    let badge = "Quiz Starter";

    if (averageScore >= 15) {

        level = "Advanced";
        badge = "Quiz Master";

    } else if (averageScore >= 8) {

        level = "Intermediate";
        badge = "Smart Learner";

    }

    if (document.getElementById("totalPoints"))
        document.getElementById("totalPoints").textContent = totalPoints;

    if (document.getElementById("quizzesTaken"))
        document.getElementById("quizzesTaken").textContent = quizzesTaken;

    if (document.getElementById("averageScore"))
        document.getElementById("averageScore").textContent = averageScore + "%";

    if (document.getElementById("currentLevel"))
        document.getElementById("currentLevel").textContent = level;

    if (document.getElementById("badgeEarned"))
        document.getElementById("badgeEarned").textContent = badge;
}

if (document.getElementById("totalPoints")) {
    window.loadStudentProgress();
}