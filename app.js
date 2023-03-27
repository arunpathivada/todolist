const express = require("express");
const bodyparser = require("body-parser");

//requiring our mongoose package
const mongoose = require("mongoose");
const app = express();

const lodash = require("lodash");

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


const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

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

app.get("/:customListName",function(req,res){
  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({name:customListName })
  .then((docs)=>{
       res.render("list",{listTitle:docs.name,newListItems: docs.items}) 
  })
  .catch((err)=>{
    const list = new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
      console.log("its a new list");
  }); 

  
});

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then((docs)=>{
        docs.items.push(item);
        docs.save();
        res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then((doc)=> {
      console.log("Successfully Deleted!");
          res.redirect("/");
     })
    .catch((err)=>{
      console.log(err)
    })  
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((doc)=>{
      res.redirect("/"+listName);
    });
  } 

  });


app.listen(3000,function(){
  console.log("server started on port 3000..");
});
