import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

const messageModel = mongoose.model("Message", messageSchema);


export default messageModel;