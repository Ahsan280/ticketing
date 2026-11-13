import { useEffect, useState } from "react";
import useRequest from '../../hooks/use-request'
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
const stripePromise = loadStripe(
    "pk_test_51UXzVmQRy4rL5y3X8xdUmn8ihaZNx5yWl1IBng41U6kJ46SCtv0xTPnTDcuwuvkHTdnWmRCJPXVhoWdyirQ6417600qSONit2D"
);

const CheckoutForm = ({ doRequest, errors }) => {
    const stripe = useStripe();
    const elements = useElements();
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const card = elements.getElement(CardElement);
        const { token, error } = await stripe.createToken(card);

        if (error) {
            console.log(error.message);
            return;
        }

        console.log(token);
        const { id } = token;
        doRequest({ token: id })
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3">
            <CardElement />
            <button type="submit" className="btn btn-primary mt-3" disabled={!stripe}>
                Pay
            </button>
            {errors}
        </form>
    );
};

const OrderShow = ({ order }) => {

    const [timeLeft, setTimeLeft] = useState(0);
    const router = useRouter();
    const { doRequest, errors } = useRequest(
        {
            url: '/api/payments',
            method: 'post',
            body: {
                orderId: order.id
            },
            onSuccess: (payment) => {
                router.push("/orders")
            }
        }
    );
    useEffect(() => {

        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.max(Math.round(msLeft / 1000), 0));
        }
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => clearInterval(timerId);
    }, [])
    if (timeLeft <= 0) {
        return <div>Order Expired</div>
    }

    return <div>
        Time left to pay: {timeLeft} seconds
        <Elements stripe={stripePromise}>
            <CheckoutForm doRequest={doRequest} errors={errors} />
        </Elements>
    </div>
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
}
export default OrderShow;
