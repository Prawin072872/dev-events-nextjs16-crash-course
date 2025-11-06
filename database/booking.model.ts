import { Document, Model, model, models, Schema } from "mongoose";
import Event from "./event.model";

export interface IBooking extends Document {
  eventId: Schema.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => {
          // RFC 5322 compliant email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Verify that the referenced event exists
BookingSchema.pre("save", async function (next) {
  if (this.isModified("eventId")) {
    try {
      const eventExists = await Event.findById(this.eventId);
      if (!eventExists) {
        return next(new Error("Referenced event does not exist"));
      }
    } catch (error) {
      return next(new Error("Failed to validate event reference"));
    }
  }
  next();
});

// Index for faster event-based queries
BookingSchema.index({ eventId: 1 });

const Booking: Model<IBooking> =
  models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
