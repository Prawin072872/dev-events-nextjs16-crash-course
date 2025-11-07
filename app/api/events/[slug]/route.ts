import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import { Error as MongooseError } from "mongoose";

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug identifier
 */


export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    // Validate slug parameter existence
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { 
          message: "Slug parameter is required",
          error: "MISSING_SLUG"
        },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase alphanumeric with hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { 
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens",
          error: "INVALID_SLUG_FORMAT"
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug with lean for better performance
    const event = await Event.findOne({ slug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { 
          message: `Event with slug "${slug}" not found`,
          error: "EVENT_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      { 
        message: "Event retrieved successfully",
        event
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("[GET /api/events/[slug]] Error:", error);

    // Handle Mongoose validation errors
    if (error instanceof MongooseError.ValidationError) {
      return NextResponse.json(
        { 
          message: "Validation error occurred",
          error: "VALIDATION_ERROR",
          details: error.message
        },
        { status: 400 }
      );
    }

    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    if (error instanceof MongooseError.CastError) {
      return NextResponse.json(
        { 
          message: "Invalid data format",
          error: "CAST_ERROR",
          details: error.message
        },
        { status: 400 }
      );
    }

    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        message: "Internal server error while fetching event",
        error: "INTERNAL_SERVER_ERROR",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
