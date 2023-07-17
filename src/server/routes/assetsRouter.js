const express = require("express");
const router = express.Router();

const supportedAssets = ["svg", "png", "jpg", "jpeg", "mp4", "gif", "ogv"];

const assetsExtensionRegex = () => {
    const formattedExtensionList = supportedAssets.join("|");
    return new RegExp(`/.+\.(${formattedExtensionList})$`);
};

router.get(assetsExtensionRegex(), (req, res) => {
    res.redirect(303, `http://localhost:3000/src/client/assets/${req.path}`)
});

module.exports = router;