/* global d3 */
$(document).ready( () => {

  // const gist = {
  // uri: "https://api.myjson.com/bins/t6tmq"
  // verb: "PUT"
  // };
  const gist = {
    uri: "https://jsonblob.com/api/jsonBlob/ac77e6c7-5e55-11e8-a54b-372774b9f527",
    verb: "PUT"
  };

  $("svg").attr("height", 0.6 * $(window).height())
    .attr("width", 0.9 * $("#container").width());


  
  getUserData(gist, function(userData){
    drawBarChart(userData);
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
    getUserData(gist, data => { 
      // find the user
      const users = data.users;
      const user = users.filter(user => user.email === form_contents.email)[0];
      if(!user) {
        // No user found, so create a new one
        // Create the new contents of the users.json gist file.
        users.push(form_contents);
        $.ajax({
          url: gist.uri,
          type: gist.verb,
          headers: {"Accept": "application/json"},
          contentType: "application/json",
          data: JSON.stringify({users}),
          success: () => {
            // close the form.
            $("#login").collapse("hide");
            // show the about.
            $("#about").removeClass("d-none");
            // wipe the chart.
            $("svg").html("");
            // draw the chart.
            drawBarChart({users, highlight: form_contents.age});
          }, 
          error: (e) => {
            console.log(e);
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
          // close the form.
          $("#login").collapse("hide");
          // show the about
          $("#about").removeClass("d-none");
          // wipe any old highlights.
          $(".bar").removeClass("highlight");
          // highlight the appropriate age bar.
          $("#bar-" + user.age).addClass("highlight");
        }
      }
    });
  });
});


function getUserData(gist, callback){
  $.getJSON(gist.uri, function(data){
    callback(data);
  });
}

function drawBarChart(gistData){
  // data takes the form of:
  // { users: [user array],
  //   highlight: stringed number
  // }
  //
  // Pull the ages from the user data.
  const ages = gistData.users.map( user => parseInt(user.age) ).sort((a, b) => a - b);
  // Get the unique ages.
  const uniqueAges = new Set(ages);
  // Build out a count for each age
  const data = [...uniqueAges].map( age => { 
    return { age, count: ages.filter(a => a === age).length};
  });

  // This all basically copy pastes https://bl.ocks.org/mbostock/3885304
  const svg = d3.select("svg"),
    margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
  const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);
  const g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

  // Read in the data.
  // Set the y limits for the height of the chart based on the largest value for count.
  y.domain([0, d3.max(data, d => d.count)]);
  // use d3's band scale to make categorical data.
  x.domain(data.map(d => d.age));

  // Build the x axis
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", .5 * width)
    .attr("y", 25)
    .attr("fill", "#000")
    .text("Age");

  // Build the y axis
  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(data.length))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.75em")
    .attr("text-anchor", "end")
    .attr("fill", "#000")
    .text("Count");

  // Draw the bars
  g.selectAll(".bar") // these don't yet exist
    .data(data) // d3's magical forEach
    .enter().append("rect") // draw the curr. bar.
    .attr("class", "bar")
    .attr("id", d => "bar-" + d.age) // give it an id for later
    .attr("y", d => y(d.count))
    .attr("x", d => x(d.age))
    .attr("height", d => height - y(d.count))
    .attr("width", x.bandwidth());

  if(gistData.highlight){
    // A highlight value was passed along
    $("#bar-" + gistData.highlight).addClass("highlight");
  }
}



