const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  grade: { type: String, enum: ["7","8","9"] },
  term: String,
  subjects: {
    mathematics: Number,
    english: Number,
    kiswahili: Number,
    integratedScience: Number,
    agriculture: Number,
    socialStudies: Number,
    preTechnical: Number,
    religiousStudies: Number,
    creativeArts: Number
  },
  comment: String,
  total: Number,
  mean: Number,
  band: { type: String, enum: ["EE","ME","AE","BE"] }
});

module.exports = mongoose.model("Student", studentSchema);
