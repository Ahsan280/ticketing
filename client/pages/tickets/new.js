import { useState } from "react"
import useRequest from "../../hooks/use-request";
import { useRouter } from "next/router";

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const router = useRouter();
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: () => { router.push("/"); }
    });

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    }

    const onSubmit = (event) => {
        event.preventDefault();
        doRequest();
    }
    return <div>
        <h1>Create a ticket</h1>
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input className="form-control" onChange={(e) => setTitle(e.target.value)} value={title} />
            </div>
            <div className="form-group">
                <label>Price</label>
                <input className="form-control" onBlur={onBlur} onChange={(e) => setPrice(e.target.value)} value={price} />
            </div>
            <button className="btn btn-primary">Submit</button>
        </form>
        {errors}
    </div>
}

export default NewTicket