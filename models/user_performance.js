const mongoose = require('mongoose');

let user_performance_schema = mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    performance: {
        int_add_sub: [Number],
        sim_add_sub: [Number],
        rational_add_sub: [Number],
        int_mul: [Number],
        sim_mul: [Number],
        int_div: [Number],
        sim_div: [Number],
        rational_mul: [Number],
        rational_div: [Number],
    },
},
{
    versionKey: false
})

module.exports = mongoose.model('user_performance', user_performance_schema);