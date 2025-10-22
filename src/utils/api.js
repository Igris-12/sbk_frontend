import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
export const postData = async (url, formData) => {
    try {
        const response = await axios.post(
            apiUrl + url,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("accesstoken")}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;

    } catch (error) {
        console.error("Error posting data:", error);

        // IMPORTANT: Return the error response data from backend
        if (error.response && error.response.data) {
            return error.response.data;  // This contains { error: true, message: "Invalid OTP" }
        }

        return {
            error: true,
            success: false,
            message: error.message || "Network error occurred"
        };
    }
}

export const fetchDataFromApi = async (url) => {
    try {
        const params = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("accesstoken")}`,
                'Content-Type': 'application/json',
            },
        };
        const { data } = await axios.get(apiUrl + url, params);

        return data;

    } catch (error) {
        console.log(error);
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return {
            error: true,
            success: false,
            message: error.message || "Network error occurred"
        };
    }
}

export const uploadImage = async (url, updatedData) => {
    try {
        const params = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accesstoken')}`,
                'Content-Type': 'multipart/form-data',
            },
        };
        var response;
        // Making the PUT request using Axios
        await axios.put(apiUrl + url, updatedData, params).then((data) => {
            response = data;
        })
        return response;

    } catch (error) {
        console.error("Error editing profile image:", error);

        // Standardized error response handling (as seen in your other utilities)
        if (error.response && error.response.data) {
            return error.response.data;
        }

        return {
            message: error.message || "Network error occurred",
            error: true,
            success: false
        };
    }
};



export const editData = async (url, updatedData) => {
    try {
        const params = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accesstoken')}`,
                'Content-Type': 'application/json',
            },
        };
        var response;
        // Making the PUT request using Axios
        await axios.put(apiUrl + url, updatedData, params).then((data) => {
            response = data;
        })
        return response;

    } catch (error) {
        console.error("Error editing data:", error);

        // Standardized error response handling (as seen in your other utilities)
        if (error.response && error.response.data) {
            return error.response.data;
        }

        return {
            message: error.message || "Network error occurred",
            error: true,
            success: false
        };
    }
};