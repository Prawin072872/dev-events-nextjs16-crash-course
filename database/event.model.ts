import { Document, Model, model, models, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
        maxlength: [100, 'Title Cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
        maxlength: [1000, 'Description Cannot exceed 1000 characters'],
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
        maxlength: [500, 'Overview Cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
        trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
          values : ["online", "offline", "hybrid"],
          message: 'Mode must be either online, offline or hybrid',
      },
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Generate slug from title and normalize date/time
EventSchema.pre("save", function (next) {
  // Generate slug only if title is modified or document is new
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  }

  // Normalize date to ISO format if modified
  if (this.isModified("date")) {
    try {
      const parsedDate = new Date(this.date);
      if (isNaN(parsedDate.getTime())) {
        return next(new Error("Invalid date format"));
      }
      this.date = parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
    } catch (error) {
      return next(new Error("Invalid date format"));
    }
  }

  // Normalize time to HH:MM format if modified
  if (this.isModified("time")) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(this.time)) {
      return next(new Error("Time must be in HH:MM format"));
    }
  }

  next();
});

// Index for faster slug-based queries
EventSchema.index({ slug: 1 });

const Event: Model<IEvent> =
  models.Event || model<IEvent>("Event", EventSchema);

export default Event;
