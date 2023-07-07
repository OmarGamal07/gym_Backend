const { getClubs, getClub, getRules, makeReport, userMakeSub, confirmPayment, getClubAuth, searchClub, searchClubByName, filterClubs, depositWallet, confirmDeposit, getUserWallet, userBooking, addOrRemoveFav, getUserFav, renewClubByWallet ,getprofile,updateProfile,getBlog,getOpinnion} = require("../controllers/user")
const router = require("express").Router()
const verifyToken = require("../middlewares/verifyToken")
const upload = require("../middlewares/upload");


router.get("/clubs", getClubs)
router.get("/blogs", getBlog)
router.get("/opinions", getOpinnion)
router.get("/club/:club_id", getClub)
router.get("/club", searchClub)
router.get("/club_auth/:club_id", verifyToken, getClubAuth)
router.post("/clubs/search", searchClubByName)
router.get("/clubs/filter", filterClubs)
router.get("/rules", getRules)
router.post("/user_reports", makeReport)
router.post("/make_sub/:subId", verifyToken, userMakeSub)
router.post("/confirm_payment/:subId", verifyToken, confirmPayment)
router.post("/renew_club_wallet/:subId", verifyToken,renewClubByWallet)
router.post("/wallet", depositWallet)
router.post("/wallet_confirm", verifyToken, confirmDeposit)
router.get("/wallet", verifyToken, getUserWallet)
router.get("/booking", verifyToken, userBooking)
router.put("/fav/:club_id", verifyToken, addOrRemoveFav)
router.get("/fav", verifyToken, getUserFav)
router.get("/profile", verifyToken, getprofile)
router.put("/profile", [verifyToken,upload('User').single('image')], updateProfile)

module.exports = router
