import { TMenuModel } from "@/types/types";
import mongoose, { Schema, Document } from "mongoose";

const ObjectId = Schema.ObjectId;

const ValidationSchema: Schema = new Schema({
    code: String,
    type: String,
    value: Schema.Types.Mixed
  }, { _id : false });

const FieldSchema: Schema = new Schema({
    name: String,
    key: String,
    description: String,
    type: String,
    validations: [ValidationSchema],
    system: Boolean
  });

const ItemSchema: Schema = new Schema({
    fields: {
      type: [FieldSchema],
      default: []
    }
});

const TranslationSchema: Schema = new Schema({
    enabled: {
      type: Boolean,
      default: true
    }
});

const MenusSchema: Schema = new Schema({
    userId: {
        type: ObjectId,
        require: true
    },
    projectId: {
        type: ObjectId,
        require: true
    },
    name: String,
    code: {
      type: String,
      require: true
    },
    items: {
        type: ItemSchema
    },
    translations: {
        type: TranslationSchema
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
});
MenusSchema.set('toObject', { virtuals: true });
MenusSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Menus || mongoose.model < TMenuModel & Document > ("Menus", MenusSchema);