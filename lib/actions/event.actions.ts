'use server';
import Event from '@/database/event.model'
import connectDB from "@/lib/mongodb";
import {cacheLife} from "next/cache";

export const getSimilarEventsBySlug = async(slug : string) => {
    'use cache';
    cacheLife('hours');
    try{
        await connectDB();
        const event = await Event.findOne({slug})
        if(!event) return []
        return await Event.find({_id : {$ne : event._id},tags : {$in : event.tags}}).lean()
    }catch {
        return []
    }
}
