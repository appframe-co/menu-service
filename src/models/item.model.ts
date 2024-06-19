import { TItemModel } from "@/types/types";
import mongoose, { Schema, Document } from "mongoose";

const ObjectId = Schema.ObjectId;

const DocSchema: Schema = new Schema({}, { _id : false, strict: false });
DocSchema.set('toObject', { virtuals: true });
DocSchema.set('toJSON', { virtuals: true });

const ItemsSchema: Schema = new Schema({
    userId: {
        type: ObjectId,
        require: true
    },
    projectId: {
        type: ObjectId,
        require: true
    },
    menuId: {
        type: ObjectId,
        require: true
    },
    parentId: {
        type: ObjectId,
        default: null
    },
    subject: {
        type: String,
        default: null
    },
    subjectId: {
        type: String,
        default: null
    },
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
    doc: DocSchema
});
ItemsSchema.set('toObject', { virtuals: true });
ItemsSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Items || mongoose.model < TItemModel & Document > ("Items", ItemsSchema);