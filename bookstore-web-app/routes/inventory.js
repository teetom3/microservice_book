const { Router } = require("express");

const router = Router();

const API_URL = process.env.API_URL || "http://localhost:3000";

router.get("/", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/books`);
    const books = await response.json();
    res.render("inventory", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books");
  }
});

router.post("/add", async (req, res) => {
  try {
    await fetch(`${API_URL}/books`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: { "Content-Type": "application/json" },
    });
    res.redirect("/inventory");
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).send("Error adding book");
  }
});

module.exports = router;
