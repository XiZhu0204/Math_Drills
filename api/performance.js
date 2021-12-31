const express = require('express');
const router = express.Router();
const user_performance = require('../models/user_performance');

// gets performance by name
router.get('/:name', (req, res) => {
    user_performance.find({name: `${req.params.name}`}, 'performance -_id', (err, result) => {
        if (err) {
            res.status(500).send(`Error occurred: ${err}`);
        }
        // access the array item instead of sending the one entry array
        res.status(200).json(result[0]['performance']);
    });
});

// update performance 
router.post('/', (req, res) => {
    const MAX_TIMES_STORED = 10;

    const user_name = req.body.user_name;
    const question_type = req.body.question_type;
    const average_time = req.body.average_time;
    // get the performance object and update corresponding field
    user_performance.find({name: user_name}, 'performance -_id', (err, result) => {
        if (err) {
            res.status(500).json({'Error': err});
        }
        let performance_collection = result[0]['performance'];
        let question_type_time = performance_collection[question_type];

        // add to beginning of array to achieve reverse chronological order
        question_type_time.unshift(average_time);
        // limit the size of the array to store only the most recent 10 attempts
        if (question_type_time.length > MAX_TIMES_STORED) {
            question_type_time.pop();
        }

        performance_collection[question_type] = question_type_time;
        user_performance.findOneAndUpdate({name: `${user_name}`}, {performance: performance_collection}, (err, result) => {
            if (err) {
                res.status(500).json({'Error': err});
            }
            res.status(200).json(result['performance'][question_type]);
        });
    });
});


module.exports = router;