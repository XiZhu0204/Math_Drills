const express = require('express');
const router = express.Router();
const user_performance = require('../models/user_performance');

// get list all users
router.get('/', (req, res) => {
    user_performance.find({}, 'user_name -_id', (err, user_names) => {
        if (err) {
            res.status(500).json({'Error': err});
        }
        // unpack each object into just the values
        for (let i = 0; i < user_names.length; i++){
            user_names[i] = user_names[i]['user_name']
        }
        res.status(200).json(user_names);
    })
})

// get user by name
router.get('/:name', (req, res) => {
    user_performance.find({user_name: `${req.params.name}`}, (err, result) => {
        if (err) {
            res.status(500).json({'Error': err});
        }
        if (result.length === 0) {
            res.status(404).json({'Error': "User not found."});
        } else {
            // access the array item instead of sending the one entry array
            res.status(200).json(result[0]);
        }
    });
});

// creates new user
router.post('/', (req, res) => {
    const user_name = req.body.user_name;
    let new_user = user_performance();
    new_user.user_name = user_name;
    new_user.save((err) => {
        if (err) {
            res.status(400).json({'Error': err});
        } else {
            res.status(200).end();
        }
    });
});

// delete user by name
router.delete('/:name', (req, res) => {
    user_performance.deleteOne({user_name: `${req.params.name}`}, (err, result) => {
        if (err) {
            res.status(500).json({'Error': err});
        }
        if (result['deletedCount'] === 0) {
            res.status(404).send("The user did not exist. No changes occured.");
        } else {
            res.status(200).send("The user was deleted.");
        }
    });
});

module.exports = router;