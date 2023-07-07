const Club = require("../models/Club")
const Blog = require("../models/Blog")
const Opinion = require("../models/Opinion")
const User = require("../models/User")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/ApiError")
const bcrypt = require("bcrypt")
const Rules = require("../models/Rules")
const axios = require("axios")
const UserReports = require("../models/userReports")
const { getLocationName } = require("../utils/Map")
const Subscriptions = require("../models/Subscriptions")
const userSub = require("../models/userSub")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});


exports.addClub = asyncHandler(async (req, res, next) => {
    const { name, email, password, lat, long, description, gender, from, to,allDay, commission } = req.body
    if (!req.files.clubImg) return next(new ApiError("Please Add Club Imgs", 409))
    if (!req.files.logo) return next(new ApiError("Please Add Club logo", 409))
    const place_name = await getLocationName(lat, long)
    if (!place_name) return next(new ApiError("Location Not Found", 404))
    console.log(place_name)
    const imgs_path = await Promise.all(req.files.clubImg.map(async img => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
    }));
    const logo = (await cloudinary.uploader.upload(req.files.logo[0].path)).secure_url
    await User.findOne({ email }).then(async user => {
        if (user) return next(new ApiError("User With This Email is Exists", 409))
        console.log(allDay);
        if(allDay=='false'||allDay==undefined)
        {
            console.log("asd");
            await Club.create(
                {
                    name: name.trim(),
                    country: `${(place_name.split(",")[place_name.split(",").length - 1]).trim()}`,
                    city: `${(place_name.split(",")[place_name.split(",").length - 2]).trim()}`,
                    location: place_name,
                    description,
                    gender,
                    images: imgs_path,
                    lat: Number(lat),
                    long: Number(long),
                    logo,
                    from,
                    to,
                    commission
                }).then(async club => {
                    await User.create(
                        {
                            email,
                            password: await bcrypt.hash(password, 10),
                            role: "club",
                            club: club.id,
                            home_location: place_name,
                            username: name
                        })
                    res.status(201).json({ club })
                })
        }else{
            console.log("asd2");
            await Club.create(
                {
                    name: name.trim(),
                    country: `${(place_name.split(",")[place_name.split(",").length - 1]).trim()}`,
                    city: `${(place_name.split(",")[place_name.split(",").length - 2]).trim()}`,
                    location: place_name,
                    description,
                    gender,
                    images: imgs_path,
                    lat: Number(lat),
                    long: Number(long),
                    allDay,
                    commission
                }).then(async club => {
                    await User.create(
                        {
                            email,
                            password: await bcrypt.hash(password, 10),
                            role: "club",
                            club: club.id,
                            home_location: place_name,
                            username: name
                        })
                    res.status(201).json({ club })
                })
        }
    })
})

exports.editClub = asyncHandler(async (req, res, next) => {
    const { club_id } = req.params
    const { name, lat, long, description, gender, from, to, days, commission } = req.body
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
    await Club.findById(club_id).then(async club => {
        if (!club) return next(new ApiError("Club Not Found", 404))
        await Club.findByIdAndUpdate(club_id,
            {
                name: name && name,
                country: place_name && `${place_name.split(",")[place_name.split(",").length - 1].trim() }`,
                city: place_name && `${place_name.split(",")[place_name.split(",").length - 2].trim() }`,
                location: place_name && place_name,
                description: description && description,
                gender: gender && gender,
                images: imgs_path && imgs_path,
                logo: logo && logo,
                lat: place_name && Number(lat),
                long: place_name && Number(long),
                from: from && from,
                to: to && to,
                days: days && days,
                commission: commission && commission
            }, { new: true }).then((club) => res.json({ club }))
    })
})

exports.deleteClub = asyncHandler(async (req, res, next) => {
    await Club.findById(req.params.club_id).then(async (club) => {
        if (!club) return next(new ApiError("Club Not Found", 404))
        await Club.findByIdAndDelete(club.id).then(async () => {
            await Subscriptions.deleteMany({ club: req.params.club_id })
            await User.findOneAndDelete({ club: req.params.club_id }).then(() => res.sendStatus(200))
        })
    })
})

// Add Rule
exports.addRule = asyncHandler(async (req, res, next) => {
    const { type } = req.query
    if (type === "uses" || type==="privacy"||type==="wallet") {
        const { textBody } = req.body
        if (!textBody.length) return next(new ApiError("Please Add a textBody", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { textBody }).then((uses) => res.json(uses))
            else await Rules.create({ textBody, type }).then((uses) => res.json(uses))
        })

    } else if (type === "contact_number") {
        const { phone1, phone2, location1, location2 } = req.body
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { phone1: phone1 && phone1, phone2: phone2 && phone2, location1: location1 && location1, location2: location2 && location2 }, { new: true }).then((uses) => res.json(uses))
            else await Rules.create({ phone1: phone1 && phone1, phone2: phone2 && phone2, type, location1: location1 && location1, location2: location2 && location2 }).then((uses) => res.json(uses))
        })
    } else if (type === 'main_img') {
        const main_img = req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url
        if (!main_img) return next(new ApiError("Please Add a main_img", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { main_img }).then((main_img) => res.json(main_img))
            else await Rules.create({ main_img, type }).then((main_img) => res.json(main_img))
        })
    } else if (type === 'main_logo') {
        const main_logo = req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url
        if (!main_logo) return next(new ApiError("Please Add a main_logo", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { main_logo }).then((main_img) => res.json(main_img))
            else await Rules.create({ main_logo, type }).then((main_img) => res.json(main_img))
        })
    } else if (type === 'app_bg') {
        const app_bg = req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url
        if (!app_bg && !req.body.bg_color) return next(new ApiError("Please Add a app_bg or bg_color", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, app_bg ? { app_bg, app_bg_type: "img" } : req.body.bg_color && { app_bg:"req.body.bg_color", app_bg_type: "color" } ,{new:true}).then((app_bg) => res.json({app_bg}))
            else await Rules.create(app_bg ? { app_bg, app_bg_type: "img", type } : req.body.bg_color && { app_bg: req.body.bg_color, app_bg_type: "color", type } ).then((app_bg) => res.json({app_bg}))
        })
    } else if (type === 'banner') {
        const banner_img = req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url
        if (!banner_img) return next(new ApiError("Please Add a banne image ", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { banner_img }, { new: true }).then((banner) => res.json({ banner }))
            else await Rules.create({ banner_img, type }).then((banner) => res.json({ banner }))
        })
    } else if (type === "payment") {
    } else if (type === 'app_bg') {
        const app_bg = req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url
        if (!app_bg && !req.body.bg_color) return next(new ApiError("Please Add a app_bg or bg_color", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, app_bg ? { app_bg, app_bg_type: "img" } : req.body.bg_color && { app_bg:"req.body.bg_color", app_bg_type: "color" } ,{new:true}).then((app_bg) => res.json({app_bg}))
            else await Rules.create(app_bg ? { app_bg, app_bg_type: "img" } : req.body.bg_color && { app_bg: "req.body.bg_color", app_bg_type: "color" } ,type).then((app_bg) => res.json({app_bg}))
        })
    } else if (type === "payment") {
        const { payment_type } = req.body
        if (payment_type === "paypal") {
            const { clientId, clientSecert, mode } = req.body
            await axios.post(`${mode === "sandbox" ? "https://api.sandbox.paypal.com/v1/oauth2/token" : "https://api.paypal.com/v1/oauth2/token"}`, null, {
                params: {
                    grant_type: 'client_credentials',
                },
                auth: {
                    username: clientId,
                    password: clientSecert,
                },
            }).then(async response => {
                if (response.status === 200) {
                    await Rules.findOne({ type, payment_type, mode }).then(async exists => {
                        if (exists) await Rules.findOneAndUpdate({ type, payment_type, mode }, { clientId, clientSecert, mode })
                            .then(async payment => res.status(201).json({ payment }))
                        else await Rules.create({ type, payment_type, clientId, clientSecert, mode, active: false })
                            .then(async payment => res.status(201).json({ payment }))
                    })
                }
            }).catch(err => {
                console.log(err.message)
                return next(new ApiError(err.message, 401))
            })
        }
    } else if (type === "whatsapp") {
        const { whatsapp } = req.body
        if (!whatsapp) return next(new ApiError("Whatsapp Required", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { whatsapp }).then(whatsapp => res.json({ whatsapp }))
            else await Rules.create({ whatsapp, type }).then(whatsapp => res.json({ whatsapp }))
        })
    } else if (type === "instagram") {
        const { instagram } = req.body
        if (!instagram) return next(new ApiError("Instagram Required", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { instagram }).then(instagram => res.json({ instagram }))
            else await Rules.create({ instagram, type }).then(instagram => res.json({ instagram }))
        })
    } else if (type === "facebook") {
        const { facebook } = req.body
        if (!facebook) return next(new ApiError("Facebook Required", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate({ type }, { facebook }).then(facebook => res.json({ facebook }))
            else await Rules.create({ facebook, type }).then(facebook => res.json({ facebook }))
        })
    } else if (type === "questions") {
        const { question, answer } = req.body
        if (!question || !answer) return next(new ApiError("Please Add Question And Answer", 400))
        await Rules.findOne({ type }).then(async (rule) => {
            if (rule) await Rules.findOneAndUpdate(
                { type },
                { $push: { questions: { question, answer } } }
            ).then(questions => res.json({ questions }))
            else await Rules.create({ questions: [{ question, answer }], type }).then(questions => res.json({ questions }))
        })

    }
    else return next(new ApiError("Invalid Type To Be Modify", 403))
}
)
// Payment Activate With Paypal
exports.activePayment = asyncHandler(async (req, res, next) => {
    const { payment_id } = req.params
    await Rules.findById(payment_id).then(async payment => {
        if (!payment_id) return next(new ApiError("Payment Not Found", 404))
        if (payment.mode === "sandbox") {
            await Rules.updateMany({ mode: "live" }, { active: "false" })
            await Rules.findByIdAndUpdate(payment_id, { active: true }).then(() => res.sendStatus(200))
        } else {
            await Rules.updateMany({ mode: "sandbox" }, { active: "false" })
            await Rules.findByIdAndUpdate(payment_id, { active: true }).then(() => res.sendStatus(200))
        }
    })
})

exports.getUserReports = asyncHandler(async (req, res, next) => await UserReports.find({}).then(reports => res.json({ reports })))

exports.clubReports = asyncHandler(async (req, res, next) => {
    await Club.find({}).then(async clubs => {
        const filterClubs = await Promise.all(clubs.map(async (club) => {
            const clubsGain = await Subscriptions.find({ club: club.id }).then(async (subs) => {
                let all_players = (await userSub.find({ club: club.id, expired: false })).length
                let players_day, players_month, players_year
                players_day = players_month = players_year = 0
                let day, month, year;
                day = month = year = 0
                await Promise.all(subs.map(async (sub) => {
                    if (sub.type === 'يومي') {
                        players_day=(await userSub.find({subscription:sub.id})).length
                        day += Number(sub.price)
                    } else if (sub.type === "شهري") {
                        players_month = (await userSub.find({ subscription: sub.id })).length
                        month += Number(sub.price)
                    } else {
                        players_year = (await userSub.find({ subscription: sub.id })).length
                        year += Number(sub.price)
                    }
                }))
                return {
                    club_name: club.name,
                    club_city: club.city,
                    club_players: all_players,
                    day: day * players_day,
                    month: month * players_month,
                    year: year * players_year
                }
            })
            return clubsGain
        }))
        res.json({ clubs_report: filterClubs })
    })
})

exports.deleteQuestion = asyncHandler(async (req, res, next) => {
    const { question } = req.body
    if (!question) return next(new ApiError("Add question", 400))
    await Rules.findOne({ type: "questions" }).then(async (ruleType) => {
        let questions = ruleType.questions && ruleType.questions.filter((Squestion) => Squestion.question !== question)
        ruleType.questions = questions
        await ruleType.save()
        res.json({ questions:ruleType })
    })
    
})

exports.addBlog = asyncHandler(async (req, res, next) => {
    const { name,description,nameblog } = req.body
    if (!req.files.blogImg) return next(new ApiError("Please Add blog Imgs", 409))
    const imgs_path = await Promise.all(req.files.blogImg.map(async img => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
    }));
    const blog=  await Opinion.create(
        {
            name: name.trim(),
            description,
            nameblog,
            images: imgs_path,
        })
        res.status(201).json({ blog });
})

exports.addOpinion = asyncHandler(async (req, res, next) => {
    const { name,description } = req.body
    if (!req.files.opinionImg) return next(new ApiError("Please Add opinion Imgs", 409))
    const imgs_path = await Promise.all(req.files.opinionImg.map(async img => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
    }));
    const opinion=  await Opinion.create(
        {
            name: name.trim(),
            description,
            images: imgs_path,
        })
        res.status(201).json({ opinion });
})

