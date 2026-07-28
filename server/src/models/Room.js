import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';

const participantSchema = new mongoose.Schema(
  {
    odId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PARTICIPANT,
    },
    socketId: {
      type: String,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    hostOdId: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      default: '',
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.methods.getPlaybackState = function () {
  let effectiveTime = this.currentTime;

  if (this.isPlaying && this.lastUpdatedAt) {
    const elapsed = (Date.now() - new Date(this.lastUpdatedAt).getTime()) / 1000;
    effectiveTime = this.currentTime + elapsed;
  }

  return {
    videoId: this.videoId,
    isPlaying: this.isPlaying,
    currentTime: effectiveTime,
  };
};

roomSchema.methods.findParticipant = function (odId) {
  return this.participants.find((p) => p.odId === odId);
};

roomSchema.methods.findParticipantBySocket = function (socketId) {
  return this.participants.find((p) => p.socketId === socketId);
};

const Room = mongoose.model('Room', roomSchema);

export default Room;
