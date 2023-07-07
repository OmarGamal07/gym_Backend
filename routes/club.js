const router = require("express").Router()

const { addSubscreptions, getSubscriptions, searchSubscreptions, editClub, editSubscription, deleteSubscription } = require("../controllers/club")
const { addSubscreptionvalidatior } = require("../utils/validators/club")
const imgUploader = require("../middlewares/imgUploader")

router.post("/subscription", addSubscreptionvalidatior, addSubscreptions)
router.get("/subscriptions", getSubscriptions)
router.get("/player", searchSubscreptions)
router.put("/", imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]), editClub)
router.put("/subscription/:subId", editSubscription)
router.delete("/subscription/:subId", deleteSubscription)
module.exports = router