// const { default: mongoose } = require('mongoose')
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MDB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = connectDB