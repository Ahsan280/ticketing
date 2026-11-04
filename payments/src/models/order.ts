import { OrderStatus } from "@ah-tickets/common";
import mongoose from "mongoose";

interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus
}

interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    status: OrderStatus;
    price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attr: OrderAttrs): OrderDoc;
}


const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String, required: true
        },
        price: {
            type: Number, required: true
        },
        status: {
            type: String,
            required: true
        }
    },
    {
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
    }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({ _id: attrs.id, version: attrs.version, price: attrs.price, userId: attrs.userId, status: attrs.status });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };