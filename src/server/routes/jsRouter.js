const express = require("express");
const router = express.Router();

const jsRegex = () => {
    return new RegExp(`/.+\.js`);
};

router.get(jsRegex(), (req, res) => {
    res.redirect(303, `http://localhost:3000/src/client/js/${req.path}`)
});

module.exports = router;