/* global env */
$(document).ready( () => {
  
  getUserData(function(userData){
    // draw the barchart.
    return true;
  });
  $("form#form-card").submit(function(e){
    // empty out the alert box.
    $("#alert").html("");
    // Prevent page reload on submit.
    e.preventDefault();
    // Get the form contents
    const form_contents = {
      email: $("#email").val(),
      password: $("#password").val(),
      age: $("#age").val(),
    };
    // Get the data store
    getUserData(users => { 
      // find the user
      const user = users.filter(user => user.email === form_contents.email)[0];
      const data = {users: "users", highlight: "highlight"};
      if(!user) {
        // No user found, so create a new one
        // Create the new contents of the users.json gist file.
        users.push(form_contents);
        const file_content = JSON.stringify({users: users});
        $.ajax({
          url: "https://api.github.com/gists/" + env.gistID,
          headers: {"Authorization": "token " + env.accessKey},
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify({
            description: "User store for CMU-barchart", 
            files: { 
              "users.json": { "content": file_content } 
            } 
          }),
          success: (data) => {
            // Choose which age to highlight and return everything as data.
            data.users = users;
            data.highlight = form_contents.age;
          }, 
          error: (e) => {
            console.log(e.responseJSON);
          }
        });
      } else {
        // check password
        if(user.password !== form_contents.password){
          // light up alert.
          $("#alert").html("<div class='alert alert-danger'>Incorrect password.</div>");
        } else {
          // NB, we don't update the age, even if it's been changed in the
          // form.  
          // Choose which age to highlight and return everything as data.
          data.users = users;
          data.highlight = user.age;
        }
      }
    });
  });
});


function getUserData(callback){
  $.getJSON("https://api.github.com/gists/" + env.gistID, function(data){
    const users = JSON.parse(data.files["users.json"].content).users;
    callback(users);
  });
}
