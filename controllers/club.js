const Club = require("../models/Club")
const asyncHandler = require("express-async-handler")
const Subscriptions = require("../models/Subscriptions")
const ApiError = require("../utils/ApiError")
const User = require("../models/User")
const userSub = require("../models/userSub")
const { getLocationName } = require("../utils/Map")
const cloudinary = require("cloudinary").v2




cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

exports.addSubscreptions = asyncHandler(async (req, res, next) => {
    const clubId = req.user.id
    const { name, price, type,numberType } = req.body
    await User.findById(clubId).then(async (club) => {
        await Subscriptions.findOne({ club: club.club, type,numberType }).then(async exists => {
            if (exists) return next(new ApiError("Subscription Found With This Name", 403))
            await Subscriptions.create({ club: club.club, name, price, type,numberType }).then((sub) => res.status(201).json({ sub }))
        })
    })
})

exports.getSubscriptions = asyncHandler(async (req, res, next) => await User.findById(req.user.id)
    .then(async club => await userSub.find({ club: club.club })
        .populate({ path: "user", select: "username home_location code" })
        .populate({ path: "club", select: "name  location" })
        .populate({ path: "subscription", select: "name " })
        .then((all) => res.json({ all }))
    )
)

exports.searchSubscreptions = asyncHandler(async (req, res, next) => {
    await User.findById(req.user.id).then(async user => {
        await userSub.findOne({ code: req.query.code, club: user.club })
            .populate({ path: "user", select: "username  code" })
            .populate({ path: "subscription", select: "name price " }).then((player) => player ? res.json({ player }) : next(new ApiError("player not found", 404)))
    })
})

exports.editClub = asyncHandler(async (req, res, next) => {
    const club_id = req.user.id
    const { name, lat, long, description, gender, from, to, days } = req.body
    let imgs_path = req.files && req.files.clubImg && await Promise.all(req.files.clubImg.map(async img => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
    }))
    let logo = req.files && req.files.logo && (await cloudinary.uploader.upload(req.files.logo[0].path)).secure_url
    let place_name;
    if (lat && long) {
        place_name = await getLocationName(lat, long)
        if (!place_name) return next(new ApiError("Location Not Found", 404))
    }
    await User.findById(club_id).then(async club => {
        if (!club) return next(new ApiError("Club Not Found", 404))
        await Club.findByIdAndUpdate(club.club,
            {
                name: name && name,
                country: place_name && `${place_name.split(",")[place_name.split(",").length - 1]}`,
                city: place_name && `${place_name.split(",")[place_name.split(",").length - 2]}`,
                location: place_name && place_name,
                description: description && description,
                gender: gender && gender,
                images: imgs_path && imgs_path,
                logo: logo && logo,
                lat: place_name && Number(lat),
                long: place_name && Number(long),
                from: from && from,
                to: to && to,
                days: days && days
            }, { new: true }).then((newclub) => res.json({ club: newclub }))
    })
})

exports.editSubscription = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { subId } = req.params
    await User.findById(id).then(async club => {
        await Subscriptions.findById(subId).then(async sub => {
            if (!sub) return next(new ApiError("Subscription not found", 404))
            const { name, price, type } = req.body
            await Subscriptions.findByIdAndUpdate(subId, { name: name && name, price: price && price, type: type && type }, { new: true }).then(newsub => res.json({ sub: newsub }))
        })
    })
})

exports.deleteSubscription = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { subId } = req.params
    await User.findById(id).then(async club => {
        await Subscriptions.findById(subId).then(async sub => {
            if (!sub) return next(new ApiError("Subscription not found", 404))
            await userSub.findOne({ subscription: sub.id, expired: false }).then(async userSub => {
                if (userSub) return next(new ApiError("Can't Delete This Subscription Because Already Have Players Subscriptions", 409))
                else await Subscriptions.findByIdAndDelete(subId).then(() => res.sendStatus(200))
            })
            })
        })
})
    
exports.clubReports


