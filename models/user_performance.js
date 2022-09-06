const mongoose = require("mongoose");

const Performance = {
  avg_time: Number,
  date: String,
};

const user_performance_schema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
    },
    performance: {
      int_add_sub: [Performance],
      sim_add_sub: [Performance],
      rational_add_sub: [Performance],
      int_mul: [Performance],
      sim_mul: [Performance],
      int_div: [Performance],
      sim_div: [Performance],
      rational_mul: [Performance],
      rational_div: [Performance],
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("user_performance", user_performance_schema);
