const express = require("express");
const router = express.Router();

const cssRegex = () => {
    return new RegExp(`/.+\.css`);
};

router.get(cssRegex(), (req, res) => {
    res.redirect(303, `http://localhost:3000/src/client/css/${req.path}`)
});

module.exports = router;