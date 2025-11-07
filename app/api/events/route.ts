import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model'
import {v2 as cloudinary} from 'cloudinary';
export async function POST(req : NextRequest){
    try{
        await connectDB();
        let formData = await req.formData();
        let event;
        try{
            event = Object.fromEntries(formData.entries());
        }catch(e){
            return NextResponse.json({message : "Invalid JSON format data"},{status: 400})
        }

        const file = formData.get('image') as File;
        if(!file){
            return NextResponse.json({message : 'Image File is Required'},{status : 400})
        }
        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const updatedResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type : 'image',folder : 'DevEvents'}, (error,results) => {
                if(error) return reject(error);

                resolve(results);
            }).end(buffer)
        });

        event.image = (updatedResult as {secure_url: string}).secure_url

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda
        });
        return NextResponse.json({message: 'Event Created Successfully', event : createdEvent}, {status : 201});
    }catch(e){
        console.error(e);
        return NextResponse.json({message : 'Error Creating Events',error : e instanceof Error ? e.message : 'Unknown'},{status : 400});
    }
}


export async function GET(){
    try{
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({message: 'Event Get Successfully Successful',events}, {status : 200});
    }catch(e){
        console.error(e);
        return NextResponse.json({message : 'Error Fetching Events',error : e} , {status : 500});
    }
}