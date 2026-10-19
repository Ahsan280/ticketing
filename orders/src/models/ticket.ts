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
    isReserved(): Promise<boolean>;
}


interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAtts): TicketDoc;
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
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        },
    }
})

ticketSchema.statics.build = (attrs: TicketAtts) => {
    return new Ticket({ _id: attrs.id, price: attrs.price, title: attrs.price });
}

ticketSchema.methods.isReserved = async function () {
    const isReserved = await Order.findOne(
        { status: { $ne: OrderStatus.Cancelled }, ticket: this }
    );

    return !!isReserved;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDoc }