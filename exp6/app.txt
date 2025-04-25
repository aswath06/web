const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
let products = [];


app.get("/products", (req, res) => {res.json(products);});


app.post("/products", (req, res) => {
  const { name, price, description, category, stock } = req.body;
  const newProduct = {id: products.length + 1,name,price,description,category,stock,};
  products.push(newProduct);
  res.status(201).json(newProduct);
});


app.delete("/products/:id", (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex === -1) return res.status(404).json({ message: "Product not found" });
  products.splice(productIndex, 1);
  res.json({ message: "Product deleted" });
});


app.listen(5000, () => console.log(`Server running on port ${5000}`));
