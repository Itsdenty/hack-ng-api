// ./routes/stories.js
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.status(200).json({
            status: "OK",
            message: "Welcome to ng-hack API"
        })
    });
    app.get('/images', (req, res) => {
        req
            .galleryModel
            .find({})
            .sort({'created_at': -1})
            .exec((err, images) => res.json(images))
    });
    app.get('/images/:imageId', (req, res) => {
        // use mongo findById to get an image by id
        req
            .galleryModel
            .find({ image_id: req.params.imageId }, (err, image) => {
                if (err) {
                    return res
                        .status(500)
                        .json(err)
                }
                res
                    .status(200)
                    .json(image)
            });
    });

    app.post('/images', multipartMiddleware, (req, res) => {
        console.log(req.files)
        req
            .cloudinary
            .uploader
            .upload(req.files.image.path, function (result) {
                // Create a post model by assembling all data as object and passing to Model
                // instance
                var image = new req.galleryModel({name: req.body.name, created_at: new Date(), url: result.url, image_id: result.public_id});
                // Persist by saving
                image.save(function (err, saved) {
                    if (err) {
                        res.send(err)
                    }
                    // Redirect
                    res.json(saved);
                });
            });
    })

    app.delete('/images', (req, res) => {
        const idParam = req.webtaskContext.query.id;
        req
            .galleryModel
            .find({
                _id: idParam
            }, (err, foundImage) => {
                if (err) 
                    res.send(err)
                    //   console.log(foundImage[0])
                if (!foundImage[0]._id) 
                    return res.send('Not exst')
                req
                    .cloudinary
                    .uploader
                    .destroy(foundImage[0].image_id, function (result) {
                        console.log(result)
                        req
                            .galleryModel
                            .remove({
                                _id: idParam
                            }, (err, removed) => res.json(removed));
                    });
            })
    })
}