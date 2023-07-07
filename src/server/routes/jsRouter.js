const express = require("express");
const router = express.Router();

const jsRegex = () => {
    // console.log("Before jsRegex():", req.path);
    return new RegExp(`/.+\.js`);
};

router.get(jsRegex(), (req, res) => {
    console.log("After jsRegex():", req.path)
    res.redirect(303, `http://localhost:3000/src/client/js/${req.path}`)
});

module.exports = router;