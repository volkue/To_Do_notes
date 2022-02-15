
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();





app.set("view engine", "ejs")
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://" + process.env.MONGODB_INIT + ".mongodb.net/todolistDB");
// mongodb://localhost:27017/todolistDB");


const itemsSchema = {
    name: String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<--Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("All items added to DB")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems,

            });
        }
    });
});


app.get("/:parametr", (req, res) => {
    const customListName = _.capitalize(req.params.parametr);
    List.findOne({
        name: customListName
    }, (err, foundName) => {
        if (!err) {
            if (!foundName) {
                //Create a new list!
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an existed list
                res.render("list", {
                    listTitle: foundName.name,
                    newListItems: foundName.items,
                });
            }
        }
    })
})

app.post("/", (req, res) => {
    const itemName = req.body.addList;
    const listName = req.body.list;
    const item = new Item({
        name: itemName,
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})


app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    //from hidden input:
    const listName = req.body.listName;
    // Item.deleteOne
    //other way to delete item
    if (listName === "Today") {
        Item.findByIdAndRemove(
            checkedItemId, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("item deleted")
                }
            });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

});

//res.redirect("/");

// Item.find({}, (err, foundItems) => {
//     if (foundItems.length === 0) {
//         Item.insertMany(defaultItems, (err) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log("All items added to DB")
//             }
//         });
//         res.redirect("/");
//     } else {
//         

//     }
// })


app.get("/about", (req, res) => {
    res.render("about");
})

// app.listen(process.env.PORT || port, function () {
//     console.log(" Server is running on port 3000")
// })


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
    console.log("Server started on port " + port);
})