//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
//const date = require(__dirname + "/date.js"); to reduce the complexit of code
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB"); // creating database
mongoose.connect("mongodb+srv://Shree:shree123@cluster0.u7x3bxn.mongodb.net/?retryWrites=true&w=majority"); // to cooect our application to mongodb atlas server

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);//creating collection of name items

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


//Creating some default items
const item1 = new Item({
  name: "Welcome to to-do list"
});

const item2 = new Item({
  name: "Hit the + button to aff a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete this item"
});

const defaultItems = [item1, item2, item3];

//using mongoose insertMany which inserts more than one item into array

const listSchema = new mongoose.Schema({ // for creating new list in new dynamic page
  name: String, // name of list
  items : [itemsSchema] //that list will contain array of itemsSchema items
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

//const day = date.getDate();

  Item.find({},function(err,foundItems){
    
      if(foundItems.length == 0){  // checking if our database is empty or not
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Succes");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

          //console.log(res);
      

  })

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;  // taking item name which user have added
  const listName = req.body.list; //To which list the item is to be added

  const item = new Item({
    name: itemName
  });

  if(listName == "Today"){
    item.save();  // saving new item to our database 
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


});



// app.post("/delete", function(req, res){
//   const checkedItemID = req.body.checkbox;
//   const listName = req.body.listName;
//   console.log("checkedItemID: "+checkedItemID)
//   if(listName ==="today"){
//       Item.findByIdAndRemove(checkedItemID, function(err){
//           if(err){
//               console.log(err);
//           }else{
//               console.log("Work done successfully!");
//               res.redirect("/");
//           }
//       });
//   }else{
//       List.findOne({name:listName}, function(err, foundList){
//           foundList.items.pull({ _id: checkedItemID }); 
//           foundList.save(function(){

//               res.redirect("/" + listName);
//           });
//         });
//   }
  

// });


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", function(req,res){
  //const customListName =  req.params.customListName;
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //console.log("Doesnt exist");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        // list.save();
        // res.redirect("/" + customListName);

        list.save(function(){
          res.redirect("/"+customListName);
          });
      }
      else{
        //console.log("Exist");
        res.render('list',{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
  

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; // in which list u want to delete a particular item

  if(listName == "Today"){ // checking if the list is on home route
    Item.findByIdAndRemove(checkedItemId,function(err){ // deleting checked item
      if(err){
        console.log(err);
      }
      else{
        console.log("Succes");
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList  ){  // 2nd parameters is to pull someting from an array of items(for more visit mongoDB website)                  
      if(!err){ // if no error then redirect to custom list
        res.redirect("/" + listName);
      }
    });
  }

 
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;   // heroku creates dynamic port
if (port == null || port == "") {
  port = 3000;                   // if we want to run locally
}


app.listen(port, function() {
  console.log("Server started Succesfully");
});
