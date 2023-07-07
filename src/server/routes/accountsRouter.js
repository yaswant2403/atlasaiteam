const express = require("express");
const router = express.Router();

const accountPageRegex = () => {
    return new RegExp(`/account\/.+`);
};

router.get(accountPageRegex(), (req, res) => {
    console.log(req.path);
    res.redirect(303, `http://localhost:3000/src/client/html/account_views/${req.path}`)
});

module.exports = router;