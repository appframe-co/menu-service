import { TMenuModel } from "@/types/types";
import mongoose, { Schema, Document } from "mongoose";

const ObjectId = Schema.ObjectId;

const ItemSchema: Schema = new Schema({
    title: {
        type: String,
        maxlength: 225,
        required: true,
    },
    subject: {
        type: String,
        maxlength: 1500,
    },
    subjectId: {
        type: String,
        default: null
    },
    subjectParams: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: 'http'
    },
    items: [],
});
ItemSchema.set('toObject', { virtuals: true });
ItemSchema.set('toJSON', { virtuals: true });

const MenusSchema: Schema = new Schema({
    userId: {
        type: ObjectId,
        require: true
    },
    projectId: {
        type: ObjectId,
        require: true
    },
    title: {
        type: String,
        maxlength: 255,
        required: true
    },
    handle: {
        type: String,
        maxlength: 500,
    },
    items: [ItemSchema],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdBy: {
        type: ObjectId,
        required: true
    },
    updatedBy: {
        type: ObjectId,
        required: true
    },
});
MenusSchema.set('toObject', { virtuals: true });
MenusSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Menus || mongoose.model < TMenuModel & Document > ("Menus", MenusSchema);