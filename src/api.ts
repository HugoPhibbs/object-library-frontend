import axios from 'axios';
import dotenv from "dotenv"

dotenv.config({path:"C:\\Users\\hugop\\Documents\\Work\\object-library-frontend\\.env"})

const url = `http://${process.env.API_HOST}:${process.env.API_PORT}`
console.log(url)

const api = axios.create({
    baseURL: `http://localhost:5000`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;