document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const loginPane = document.querySelector(".bg-white");
    const loginButton = document.querySelector("button");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const registerLink = document.getElementById("register-btn"); // Register button

    // JSONBin Credentials
    const JSONBIN_ID = "67ca7dcaad19ca34f817f025";
    const API_KEY = "$2a$10$IG0fCGUHCL7iFsZMFQjI4e4ufPung048BrnWjddZBoo5V3UjUQ4ja";
    const apiUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

    // Fade-in animation
    loginPane.style.opacity = "0";
    loginPane.style.transform = "translateY(-20px)";
    setTimeout(() => {
        loginPane.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
        loginPane.style.opacity = "1";
        loginPane.style.transform = "translateY(0)";
    }, 100);

    // **Event Listeners for Login & Register**
    loginButton.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Check for empty fields
        if (!username || !password) {
            if (!username) usernameInput.classList.add("ring-2", "ring-red-500");
            if (!password) passwordInput.classList.add("ring-2", "ring-red-500");
            return;
        }
        
        // Signing in animation
        loginPane.innerHTML = "<h2 class='text-2xl font-bold text-white text-center mb-6'>Signing You In...</h2>";
        loginPane.style.transform = "translateY(-20px)";
        setTimeout(() => {
            loginPane.style.transition = "transform 0.5s ease-in-out";
            loginPane.style.transform = "translateY(0)";
        }, 500);
        
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                headers: { 'X-Master-Key': API_KEY }
            });
            const data = await response.json();
            const users = data.record.users;
            
            if (users[username] && users[username].password === password) {
                localStorage.setItem("loggedInUser", username);
                window.location.href = `pc.html?user=${encodeURIComponent(username)}`;
            } else {
                loginPane.innerHTML = `
                    <h2 class='text-2xl font-bold text-white text-center mb-6'>Login</h2>
                    <img src='./images/error.gif' class='mx-auto' alt='Error'>
                    <p class='text-white text-center mt-4'>Incorrect Username or Password</p>
                    <button id='retry-button' class='w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition duration-300 mt-4'>Retry</button>
                `;
                document.getElementById("retry-button").addEventListener("click", () => location.reload());
            }
        } catch (error) {
            console.error("Error fetching credentials:", error);
            alert("Login system error. Try again later.");
        }
    });

    registerLink.addEventListener("click", function (event) {
        event.preventDefault();
        slidePane(transitionToRegister);
    });

    // **Sliding Function**
    function slidePane(callback) {
        loginPane.style.transform = "translateX(-100%)";  // Slide Left
        setTimeout(() => {
            callback(); // Run the next step after sliding
            loginPane.style.transform = "translateX(0%)";  // Slide Back
        }, 500);
    }

    // **Register Pane Transition**
    function transitionToRegister() {
        loginPane.innerHTML = `
            <h2 class="text-2xl font-bold text-white text-center mb-6">Register With Nuvi</h2>
            <form id="register-form">
                <div class="mb-4">
                    <input class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500" type="text" id="reg-username" placeholder="Username">
                </div>
                <div class="mb-4">
                    <input class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500" type="email" id="reg-email" placeholder="Email">
                </div>
                <div class="mb-4">
                    <input class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500" type="password" id="reg-password" placeholder="Password">
                </div>
                <p class="text-center text-white mt-4">Have an Account? <button id="return-login" class="text-blue-400 hover:underline">Return</button></p>
                <button id="submit-register" class="w-full py-3 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-200 transition duration-300 mt-4">Register</button>
            </form>
        `;

        document.getElementById("submit-register").addEventListener("click", validateAndRegister);
        document.getElementById("return-login").addEventListener("click", function () {
            slidePane(() => location.reload());
        });
    }

    // **Validation & Registration Process**
    async function validateAndRegister(event) {
        event.preventDefault();
        const username = document.getElementById("reg-username").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!username || !email || !password) {
            alert("All fields are required!");
            return;
        }
        if (!emailRegex.test(email)) {
            alert("Enter a valid email (example@mail.com)");
            return;
        }

        slidePane(showLoadingScreen);

        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
            });
            const data = await response.json();
            let users = data.record.users;
            
            if (users[username]) {
                alert("Username already exists!");
                slidePane(transitionToRegister);
                return;
            }
            
            users[username] = { email, password };
            
            await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users })
            });

            slidePane(showSuccessScreen);
        } catch (error) {
            alert("Error registering. Try again!");
            console.error(error);
            slidePane(transitionToRegister);
        }
    }

    // **Loading Screen Animation**
    function showLoadingScreen() {
        loginPane.innerHTML = `
            <div class="text-center">
                <img src="./images/loading.gif" alt="Loading..." class="mx-auto w-16">
                <p class="text-white mt-4">Registering Please Wait...</p>
            </div>
        `;
    }

    // **Success Screen Transition**
    function showSuccessScreen() {
        loginPane.innerHTML = `
            <div class="text-center">
                <img src="./images/sucessful.gif" alt="Success" class="mx-auto w-16">
                <p class="text-white mt-4">Registration Success. You will be taken to Login section now</p>
            </div>
        `;

        setTimeout(() => location.reload(), 3000);
    }

    // **Apply Transition Effects**
    loginPane.style.transition = "transform 0.5s ease-in-out";
});
document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const loginPane = document.querySelector(".bg-white");
    const loginButton = document.querySelector("button");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const registerLink = document.getElementById("register-btn"); // Register button

    // JSONBin Credentials
    const JSONBIN_ID = "67ca7dcaad19ca34f817f025";
    const API_KEY = "$2a$10$IG0fCGUHCL7iFsZMFQjI4e4ufPung048BrnWjddZBoo5V3UjUQ4ja";
    const apiUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

    // Fade-in animation
    loginPane.style.opacity = "0";
    loginPane.style.transform = "translateY(-20px)";
    setTimeout(() => {
        loginPane.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
        loginPane.style.opacity = "1";
        loginPane.style.transform = "translateY(0)";
    }, 100);

    // **Event Listeners for Login & Register**
    loginButton.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Check for empty fields
        if (!username || !password) {
            if (!username) usernameInput.classList.add("ring-2", "ring-red-500");
            if (!password) passwordInput.classList.add("ring-2", "ring-red-500");
            return;
        }
        
        // Signing in animation
        loginPane.innerHTML = "<h2 class='text-2xl font-bold text-white text-center mb-6'>Signing You In...</h2>";
        loginPane.style.transform = "translateY(-20px)";
        setTimeout(() => {
            loginPane.style.transition = "transform 0.5s ease-in-out";
            loginPane.style.transform = "translateY(0)";
        }, 500);
        
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                headers: { 'X-Master-Key': API_KEY }
            });
            const data = await response.json();
            const users = data.record.users;
            
            if (users[username] && users[username].password === password) {
                localStorage.setItem("loggedInUser", username);
                window.location.href = `pc.html?user=${encodeURIComponent(username)}`;
            } else {
                loginPane.innerHTML = `
                    <h2 class='text-2xl font-bold text-white text-center mb-6'>Login</h2>
                    <img src='./images/error.gif' class='mx-auto' alt='Error'>
                    <p class='text-white text-center mt-4'>Incorrect Username or Password</p>
                    <button id='retry-button' class='w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition duration-300 mt-4'>Retry</button>
                `;
                document.getElementById("retry-button").addEventListener("click", () => location.reload());
            }
        } catch (error) {
            console.error("Error fetching credentials:", error);
            alert("Login system error. Try again later.");
        }
    });

    registerLink.addEventListener("click", function (event) {
        event.preventDefault();
        slidePane(transitionToRegister);
    });

    // **Sliding Function**
    function slidePane(callback) {
        loginPane.style.transform = "translateX(-100%)";  // Slide Left
        setTimeout(() => {
            callback(); // Run the next step after sliding
            loginPane.style.transform = "translateX(0%)";  // Slide Back
        }, 500);
    }

    // **Register Pane Transition**
    function transitionToRegister() {
        loginPane.innerHTML = `
            <h2 class="text-2xl font-bold text-white text-center mb-6">Register With Nuvi</h2>
            <form id="register-form">
                <div class="mb-4">
                    <input class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500" type="text" id="reg-username" placeholder="Username">
                </div>
                <div class="mb-4">
                    <input class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500" type="email" id="reg-email" placeholder="Email">
                </div>
                <div class="mb-4">
                    <input class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500" type="password" id="reg-password" placeholder="Password">
                </div>
                <p class="text-center text-white mt-4">Have an Account? <button id="return-login" class="text-blue-400 hover:underline">Return</button></p>
                <button id="submit-register" class="w-full py-3 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-200 transition duration-300 mt-4">Register</button>
            </form>
        `;

        document.getElementById("submit-register").addEventListener("click", validateAndRegister);
        document.getElementById("return-login").addEventListener("click", function () {
            slidePane(() => location.reload());
        });
    }

    // **Validation & Registration Process**
    async function validateAndRegister(event) {
        event.preventDefault();
        const username = document.getElementById("reg-username").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!username || !email || !password) {
            alert("All fields are required!");
            return;
        }
        if (!emailRegex.test(email)) {
            alert("Enter a valid email (example@mail.com)");
            return;
        }

        slidePane(showLoadingScreen);

        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
            });
            const data = await response.json();
            let users = data.record.users;
            
            if (users[username]) {
                alert("Username already exists!");
                slidePane(transitionToRegister);
                return;
            }
            
            users[username] = { email, password };
            
            await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users })
            });

            slidePane(showSuccessScreen);
        } catch (error) {
            alert("Error registering. Try again!");
            console.error(error);
            slidePane(transitionToRegister);
        }
    }

    // **Loading Screen Animation**
    function showLoadingScreen() {
        loginPane.innerHTML = `
            <div class="text-center">
                <img src="./images/loading.gif" alt="Loading..." class="mx-auto w-16">
                <p class="text-white mt-4">Registering Please Wait...</p>
            </div>
        `;
    }

    // **Success Screen Transition**
    function showSuccessScreen() {
        loginPane.innerHTML = `
            <div class="text-center">
                <img src="./images/sucessful.gif" alt="Success" class="mx-auto w-16">
                <p class="text-white mt-4">Registration Success. You will be taken to Login section now</p>
            </div>
        `;

        setTimeout(() => location.reload(), 3000);
    }

    // **Apply Transition Effects**
    loginPane.style.transition = "transform 0.5s ease-in-out";
});
document.addEventListener("DOMContentLoaded", function () {
    const loginPane = document.querySelector(".bg-white");
    const forgotPasswordBtn = document.getElementById("for-btn");
    const JSONBIN_ID = "67ca7dcaad19ca34f817f025";
    const API_KEY = "$2a$10$IG0fCGUHCL7iFsZMFQjI4e4ufPung048BrnWjddZBoo5V3UjUQ4ja";
    const BREVO_API_KEY = "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";
    
    function fadeOutAndReplace(content) {
        loginPane.style.transition = "opacity 0.5s ease-out";
        loginPane.style.opacity = "0";
        setTimeout(() => {
            loginPane.innerHTML = content;
            loginPane.style.opacity = "1";
        }, 500);
    }

    forgotPasswordBtn.addEventListener("click", function () {
        fadeOutAndReplace(`
            <h2 class='text-2xl font-bold text-white text-center mb-6'>Forgot Password</h2>
            <div class='mb-4'>
                <input class='w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white' type='text' id='fp-username' placeholder='Username'>
            </div>
            <div class='mb-4'>
                <input class='w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white' type='email' id='fp-email' placeholder='Email'>
            </div>
            <button id='send-otp' class='w-full py-3 bg-white text-purple-900 font-bold rounded-lg'>Send OTP</button>
        `);
        
        setTimeout(() => {
            document.getElementById("send-otp").addEventListener("click", function () {
                const username = document.getElementById("fp-username").value.trim();
                const email = document.getElementById("fp-email").value.trim();
                
                if (!username || !email) {
                    alert("All fields are required!");
                    return;
                }
                
                fadeOutAndReplace(`<img src='./images/loading.gif' class='mx-auto'><p class='text-white text-center'>Processing request...</p>`);
                
                setTimeout(() => {
                    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
                        method: "GET",
                        headers: { "X-Master-Key": API_KEY }
                    })
                    .then(res => res.json())
                    .then(data => {
                        const users = data?.record?.users; // Fixed JSON structure issue
                        if (!users || !users[username] || users[username].email !== email) {
                            fadeOutAndReplace(`<p class='text-red-500 text-center'>User not found!</p>`);
                            setTimeout(() => { window.location.reload(); }, 3000);
                            return;
                        }
                        
                        const otp = Math.floor(100000 + Math.random() * 900000);
                        localStorage.setItem("nuvi-otp", otp);
                        
                        fetch("https://api.brevo.com/v3/smtp/email", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "api-key": BREVO_API_KEY
                            },
                            body: JSON.stringify({
                                sender: { email: "enuviverify@gmail.com", name: "Nuvi Services" },
                                to: [{ email: email }],
                                subject: "Nuvi OTP Verification",
                                htmlContent: `<p>Your OTP: <strong>${otp}</strong></p>`
                            })
                        }).then(res => res.json())
                        .then(response => {
                            if (response.messageId) {
                                fadeOutAndReplace(`
                                    <h2 class='text-2xl font-bold text-white text-center mb-6'>Enter OTP</h2>
                                    <div class='mb-4'>
                                        <input class='w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white' type='text' id='otp' placeholder='Enter OTP'>
                                    </div>
                                    <button id='verify-otp' class='w-full py-3 bg-white text-purple-900 font-bold rounded-lg'>Verify OTP</button>
                                `);
                                
                                setTimeout(() => {
                                    document.getElementById("verify-otp").addEventListener("click", function () {
                                        const enteredOTP = document.getElementById("otp").value.trim();
                                        const storedOTP = localStorage.getItem("nuvi-otp");
                                        
                                        if (enteredOTP === storedOTP) {
                                            fadeOutAndReplace(`<img src='./images/sucessful.gif' class='mx-auto'><p class='text-green-500 text-center'>Identity Verified! Redirecting...</p>`);
                                            setTimeout(() => { window.location.href = `pc.html?user=${username}`; }, 3000);
                                        } else {
                                            fadeOutAndReplace(`<img src='./images/error.gif' class='mx-auto'><p class='text-red-500 text-center'>Verification Failed! Redirecting...</p>`);
                                            setTimeout(() => { window.location.href = "pc.html"; }, 3000);
                                        }
                                    });
                                }, 500);
                            } else {
                                fadeOutAndReplace(`<p class='text-red-500 text-center'>Failed to send OTP. Try again later.</p>`);
                                setTimeout(() => { window.location.reload(); }, 3000);
                            }
                        }).catch(() => {
                            fadeOutAndReplace(`<p class='text-red-500 text-center'>Error sending OTP. Try again.</p>`);
                            setTimeout(() => { window.location.reload(); }, 3000);
                        });
                    }).catch(() => {
                        fadeOutAndReplace(`<p class='text-red-500 text-center'>Error fetching user data. Try again.</p>`);
                        setTimeout(() => { window.location.reload(); }, 3000);
                    });
                }, 3000);
            });
        }, 500);
    });
});




