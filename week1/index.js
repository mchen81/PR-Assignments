var express = require("express");
var app = express();
const Sequelize = require("sequelize");

const sequelize = new Sequelize("jerrydb", "jerrychen", "jerry1234", {
  host: "localhost",
  port: "5432",
  dialect: "postgres",
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

// ==========================================Models Set UP=====================================
const List = sequelize.define(
  "todo_list",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    list_name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
  },
  { underscored: true }
);

const Item = sequelize.define(
  "todo_item",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_done: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
  },
  { underscored: true }
);
// List.hasMany(Item, {as: 'TodoList', foreignKey: 'list_id' });
// Item.belongsTo(List, { as: 'TodoList', foreignKey: 'list_id' });

  // when reset database:
  List.sync({force: true}).then(() =>{
    List.hasMany(Item, {as: 'TodoList', foreignKey: 'list_id' });
    Item.belongsTo(List, { as: 'TodoList', foreignKey: 'list_id' });

  }).then(function(){
    return Item.sync({force: true});
  });

// ==========================================GET=====================================
app.get("/lists", function (req, res) {
  List.findAll({
    attributes: ["id", "list_name"],
  }).then(function (lists) {
    res.send(lists);
  });
});

app.get("/items", function (req, res) {
  let listId = req.query.listid;
  Item.findAll({
    attributes: ["id", "item_name", "is_done"],
    where: {
      list_id: listId,
    },
  }).then(function (items) {
    res.send(items);
  });
});

// ==========================================POST=====================================
app.post("/addTodoList", function (req, res) {
  let listname = req.query.listname;
  List.create({ list_name: listname });
  res.send(listname + " Added");
});

app.post("/addTodoItem", async function (req, res) {
  let listId = req.query.listid;
  let itemName = req.query.itemname;

  const list = await List.findOne({ where: { id: listId } });
  const item = await Item.create({
    item_name: itemName,
    is_done: false,
  });
  item.setTodoList(list);

  res.send(itemName + " Added");
});

// ==========================================PUT=====================================
app.put("/updateItemStatus", function (req, res) {
  let itemId = req.query.itemid;
  let isDone = req.query.isdone;
  var status = false;
  if (isDone === "true") {
    status = true;
  }
  Item.update(
    { is_done: isDone },
    {
      where: {
        id: itemId,
      },
    }
  );
  res.send("The item has been updated");
});

// ==========================================DELETE=====================================
app.delete("/deleteList", function (req, res) {
  let listId = req.query.listid;
  List.destroy({
    where: {
      id: listId,
    },
  });

  res.send("The list has been deleted");
});

// Delete - delete a item
app.delete("/deleteItem", function (req, res) {
  let itemId = req.query.itemid;
  Item.destroy({
    where: {
      id: itemId,
    },
  });
  res.send("The item has been deleted");
});

// ==========================================SERVER START=====================================
app.listen(3000, function () {
  console.log("Server running");
});
