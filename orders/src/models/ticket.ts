import mongoose from "mongoose";
import { Order, OrderStatus } from "./orders";

interface TicketAtts {
    id: string;
    title: string;
    price: number;
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}


interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAtts): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    versionKey: 'version',
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        },
    }
})

ticketSchema.statics.build = (attrs: TicketAtts) => {
    return new Ticket({ _id: attrs.id, price: attrs.price, title: attrs.title });
}
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({ _id: event.id, version: event.version - 1 })
}
ticketSchema.methods.isReserved = async function () {
    const isReserved = await Order.findOne(
        { status: { $ne: OrderStatus.Cancelled }, ticket: this }
    );

    return !!isReserved;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDoc }