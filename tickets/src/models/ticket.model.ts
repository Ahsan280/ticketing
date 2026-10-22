import mongoose from "mongoose";

interface TicketAttrs {
    title: string;
    price: number;
    userId: string
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
}


const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
}, {
    // 1. Rename the built-in version tracking field from __v to version
    versionKey: 'version',
    // 2. Enable modern native Optimistic Concurrency Control instead of the plugin
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret: any) {
            delete ret.__v;
            ret.id = ret._id;
            delete ret._id;
        },
    },
    timestamps: true,
},)


ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket }