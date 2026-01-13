const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        filename: { type: String },
        url: { type: String }
    },
    price: {
        type: Number,
        required: true
    },
    location:{
        type: String
    },
    country:{
        type: String
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

const List = mongoose.model('List', listingSchema);
module.exports = List;