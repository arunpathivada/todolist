const express = require("express");
const bodyparser = require("body-parser");

//requiring our mongoose package
const mongoose = require("mongoose");
const app = express();



app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));


//connect to mongodb..
mongoose.connect("mongodb://localhost:27017/todolistDB");


//creating a mongoose schema...
const itemsSchema ={
   name:String
}


//creating a model for our schema..
const Item =mongoose.model("Item",itemsSchema);

//documents in our database model Item..

const item1 = new Item({
  name:"welcome1"
});

const item2 = new Item({
  name:"welcome2"
});

const item3 = new Item({
  name:"welcome3"
});

const defaultItems = [item1,item2,item3];


      app.get("/", async (req, res) => {
       try {
          const foundItems = await Item.find({ });

          if(foundItems.length===0){
            Item.insertMany(defaultItems)
            .then(function () {
              console.log("Successfully saved defult items to DB");
            })
            .catch(function (err) {
              console.log(err);
            });
            res.redirect("/");
          }
          else{
            res.render("list",{listTitle: "Today",newListItems:foundItems});
          }
        } catch (err) {
          console.log(err);
        }
      });

//this is not worked in present version
// app.get("/",function(req,res){
//   Item.find({},function(err,foundItems){
//     res.render("list",{listTitle: "Today",newListItems:foundItems});
//   });
// });

app.post("/",function(req,res){
  const itemName = req.body.newItem;

  const item = new Item({
    name:itemName
  });

  item.save();
  res.redirect("/");

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId); 
      res.redirect("/");
      console.log("successfully deleted checked item");
      
  });


app.get("/work",function(req,res){
  res.render("list",{listTitle:"Work List",NewListItems:workItems})
});


app.listen(3000,function(){
  console.log("server started on port 3000..");
});
