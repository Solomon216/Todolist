const express = require("express");
const bp = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set("view engine", "ejs");

app.use(bp.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Solomon216:VlIXRUoyGriSaQim@cluster0.g6u48ff.mongodb.net/todolistDB"); 

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist"
})

const item2 = new Item({
  name:"Hit the + button to add a new item"
})

const item3 = new Item({
  name:"<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  async function getItems() {
    const items = await Item.find({});
    if (items.length === 0) {
      Item.insertMany(defaultItems);
    } else {
      res.render("index", { Title: "Today", newitem: items });
    }
  }
  getItems();
});

app.get("/:customListName", function (req, res) {
  const customListName =_.capitalize(req.params.customListName);
  
  async function getList() {
    const lists = await List.findOne({ name: customListName });
    if (!lists) {
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save();
      res.redirect("/" + customListName);
    } else { 
      res.render("index", { Title: customListName, newitem: lists.items });
    }
  }
  getList();
})

app.post("/", function (req, res) {
  const itemname = req.body.task;
  const listname = req.body.list;
  const newitem = new Item({
    name: itemname
  })

  if (listname === "Today") {
    newitem.save();
    res.redirect("/");
  } else {
    async function newlist() {
      const lists = await List.findOne({ name: listname });
      lists.items.push(newitem);
      lists.save();
      res.redirect("/" + listname);
    }
    newlist();
  }
});

app.post("/delete", function (req, res) {
  const delid = req.body.checkbox;
  const delname = req.body.listName;
  if (delname === "Today") {
    async function deleteItem() {
      await Item.findByIdAndDelete(delid);
    }
    deleteItem();
    res.redirect("/");
  } else {
    async function deleteList() {
      const lists = await List.findOne({ name: delname });
      lists.items.pull(delid);
      lists.save();
      res.redirect("/" + delname);
    }
    deleteList();
    
  } 
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
