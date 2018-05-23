/* global auth0 env */
// Copied from auth0"s quickstart single-page login guide.
window.addEventListener("load", function() {

  // Establish a connection to auth0 and get a token.
  // env is an object defined above, in env.js.
  var webAuth = new auth0.WebAuth({
    domain: env.domain,
    clientID: env.clientID,
    responseType: "token id_token",
    audience: env.audience,
    scope: "openid",
    redirectUri: window.location.href
  });

  // distinguish which button will get the listener below
  var loginBtn = document.getElementById("btn-login");

  // And what to do when that button is clicked, namely prevent the whatever
  // default action is (nothing), and authorize the webAuth object.
  loginBtn.addEventListener("click", function(e) {
    e.preventDefault();
    webAuth.authorize();
  });

  // Capture some more DOM elements.
  var loginStatus = document.querySelector(".container h4");
  var loginView = document.getElementById("login-view");
  var homeView = document.getElementById("home-view");

  // buttons and event listeners
  var homeViewBtn = document.getElementById("btn-home-view");
  var logoutBtn = document.getElementById("btn-logout");

  homeViewBtn.addEventListener("click", function() {
    homeView.style.display = "inline-block";
    loginView.style.display = "none";
  });

  logoutBtn.addEventListener("click", logout);

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = "";
        setSession(authResult);
        loginBtn.style.display = "none";
        homeView.style.display = "inline-block";
      } else if (err) {
        homeView.style.display = "inline-block";
        console.log(err);
        alert(
          "Error: " + err.error + ". Check the console for further details."
        );
      }
      displayButtons();
    });
  }

  function setSession(authResult) {
    // Set the time that the Access Token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // Access Token"s expiry time
    var expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expiresAt;
  }

  // Auth0 does this in a very funny way that I will gladly refactor.
  function displayButtons() {
    if (isAuthenticated()) {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      loginStatus.innerHTML = "You are logged in!";
    } else {
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
      loginStatus.innerHTML =
        "You are not logged in! Please log in to continue.";
    }
  }

  var userProfile;

  function getProfile() {
    if (!userProfile) {
      var accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.log("Access Token must exist to fetch profile");
      } else {
        webAuth.client.userInfo(accessToken, function(err, profile) {
          if (profile) {
            userProfile = profile;
            console.log(userProfile);
          } else {
            console.log("no profile.");
          }
        });
      }
    }
  }

  // And once everything is located
  handleAuthentication();
  getProfile();
});  

