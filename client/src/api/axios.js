import axios from 'axios';

// Create an 'instance' of axios
export default axios.create({
    baseURL: 'http://localhost:5000/api', // Your backend's base URL
    headers: {
        'Content-Type': 'application/json'
    }
});