// Backend API URL
const API = "http://localhost:5001";

// Socket.io
const socket = io(API);

socket.on("newPoll", () => {
    loadPolls();
});

// Authentication details
let token = sessionStorage.getItem("pollToken") || "";
let mode = "signup";

// Shortcut to access HTML elements
const $ = (x) => document.getElementById(x);


// --------------------
// LOGIN / SIGNUP MODE
// --------------------

function modeSet(m) {
    mode = m;

    let up = m === "signup";

    $("nameBox").hidden = !up;
    $("name").required = up;

    $("su").classList.toggle("active", up);
    $("si").classList.toggle("active", !up);

    $("title").textContent = up ? "Create account" : "Sign in";

    $("desc").textContent = up
        ? "Sign up to use PollMaster."
        : "Sign in to manage and vote in polls.";

    $("authBtn").textContent = up ? "Create account" : "Sign in";

    $("authMsg").textContent = "";
}

$("su").onclick = () => modeSet("signup");
$("si").onclick = () => modeSet("login");


// --------------------
// SHOW DASHBOARD
// --------------------

function showDash() {
    $("auth").hidden = true;
    $("dash").hidden = false;
    $("logout").hidden = false;

    loadPolls();
}


// --------------------
// API REQUEST FUNCTION
// --------------------

async function call(path, opts = {}) {
    let r = await fetch(API + path, {
        ...opts,

        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            ...opts.headers
        }
    });

    let d = await r.json();

    if (!r.ok) {
        throw Error(d.message || d.error || "Request failed");
    }

    return d;
}


// --------------------
// SIGNUP AND LOGIN
// --------------------

$("authForm").onsubmit = async (e) => {
    e.preventDefault();

    let b = {
        email: $("email").value.trim(),
        password: $("password").value
    };

    if (mode === "signup") {
        b.name = $("name").value.trim();
    }

    try {
        let d = await call(
            mode === "signup"
                ? "/api/auth/register"
                : "/api/auth/login",
            {
                method: "POST",
                body: JSON.stringify(b)
            }
        );

        if (mode === "signup") {
            $("authMsg").style.color = "green";
            $("authMsg").textContent = "Account created. Now sign in.";

            modeSet("login");
            $("email").value = b.email;

        } else {
            token = d.token || d.accessToken || d.data?.token;

            if (!token) throw Error("Login response has no token");

            sessionStorage.setItem("pollToken", token);

            showDash();
        }

    } catch (err) {
        $("authMsg").textContent = err.message;
    }
};


// --------------------
// LOAD POLLS
// --------------------

async function loadPolls() {
    let root = $("polls");

    root.textContent = "Loading…";

    try {
        let d = await call("/api/polls");

        let arr = Array.isArray(d)
            ? d
            : (d.polls || d.data?.polls || d.data || []);

        root.innerHTML = "";

        if (!arr.length) {
            root.textContent = "No polls yet. Create one above.";
            return;
        }

        arr.forEach((p) => {
            let id = p._id || p.id;

            let card = document.createElement("article");
            card.className = "poll";

            let h = document.createElement("h3");
            h.textContent = p.question || "Poll";

            let select = document.createElement("select");

            (p.options || []).forEach((o, i) => {
                let op = document.createElement("option");

                op.value = i;
                op.textContent = typeof o === "string"
                    ? o
                    : (o.text || o.label || "Option " + (i + 1));

                select.append(op);
            });

            let vote = document.createElement("button");
            vote.textContent = "Vote";

            vote.onclick = async () => {
                try {
                    await call("/api/responses", {
                        method: "POST",
                        body: JSON.stringify({
                            pollId: id,
                            optionIndex: +select.value
                        })
                    });

                    alert("Vote submitted");
                    loadPolls();

                } catch (e) {
                    alert(e.message);
                }
            };

            let results = document.createElement("button");
            results.textContent = "Results";

            let out = document.createElement("div");
            out.className = "result";
            out.hidden = true;

            results.onclick = async () => {
                try {
                    out.textContent = JSON.stringify(
                        await call("/api/analytics/poll/" + id),
                        null,
                        2
                    );

                    out.hidden = !out.hidden;

                } catch (e) {
                    out.textContent = e.message;
                    out.hidden = false;
                }
            };

            card.append(h, select, vote, results, out);
            root.append(card);
        });

    } catch (e) {
        root.textContent = e.message + " — check backend and refresh.";
    }
}


// --------------------
// CREATE POLL
// --------------------

$("create").onsubmit = async (e) => {
    e.preventDefault();

    let opts = [...document.querySelectorAll(".opt")]
        .map((x) => x.value.trim())
        .filter(Boolean);

    try {
        await call("/api/polls", {
            method: "POST",

            body: JSON.stringify({
                question: $("question").value.trim(),
                options: opts
            })
        });

        $("createMsg").style.color = "green";
        $("createMsg").textContent = "Poll created";

        $("create").reset();
        loadPolls();

    } catch (err) {
        $("createMsg").textContent = err.message;
    }
};


// --------------------
// REFRESH
// --------------------

$("refresh").onclick = loadPolls;


// --------------------
// LOGOUT
// --------------------

$("logout").onclick = () => {
    token = "";

    sessionStorage.removeItem("pollToken");

    $("dash").hidden = true;
    $("auth").hidden = false;
    $("logout").hidden = true;

    modeSet("login");
};


// --------------------
// INITIAL PAGE SETUP
// --------------------

if (token) {
    showDash();
} else {
    modeSet("signup");
}