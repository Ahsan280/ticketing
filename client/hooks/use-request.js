import axios from "axios";
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);
  const doRequest = async (props = {}) => {
    try {
      const response = await axios[method](url, { ...body, ...props });
      setErrors(null);
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (error) {
      setErrors(
        <div>
          {error.response.data.errors.map((error) => {
            return (
              <div key={error.message} className="text-danger">
                {error.message}
              </div>
            );
          })}
        </div>,
      );
    }
  };

  return { doRequest, errors };
};
