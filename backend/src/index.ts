import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/userRoute';
import projectRoutes from './routes/projectRoute';
import { app,server } from './socketIO';

dotenv.config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions ={
    origin:'http://localhost:5173', 
    credentials:true,           
}

app.use(cors(corsOptions));

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

const PORT = process.env.PORT || 3000; 
server.listen(3001, () => {
    console.log(`Server is running on port ${3001}`);
});
