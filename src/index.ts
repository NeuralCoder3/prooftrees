// const greeting = getGreeting("John");
// console.log(greeting);


//import unify.js
var unify = require('unify');
var variable = unify.variable;
//create some data structures to be unified
var rectangle1 = {
    location:[25, 35],
    size:[100, variable("height")],
    color:"#000000"
};
var rectangle2 = {
    location:variable("location"),
    size:[100, 100],
    color:"#000000"
};
//box the objects so they can be unified
var boxedRect1 = unify.box(rectangle1);
var boxedRect2 = unify.box(rectangle2);
//preform the unification
var result = boxedRect1.unify(boxedRect2);
//check if unification succeeded and print the results
if(result) {
  //print "rectangle1 height: 100" to the console
  console.log("rectangle1  height: " + 
    boxedRect1.get("height").toString());
  //print "rectangle2 location: [25, 35]" to the console
  console.log("rectangle2 location: [" + 
    boxedRect2.get("location")[0] + ", " +
    boxedRect2.get("location")[1]  + "]");
}
else {
  console.log('Unification Failed!');
}

