/* global auth0 env */
// Copied from auth0's quickstart single-page login guide.
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

  

});
