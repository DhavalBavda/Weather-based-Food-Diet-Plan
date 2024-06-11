import express from "express"
import bodyParser from "body-parser"
import fetch from "node-fetch"
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"


const app=express()
dotenv.config()

app.set("view engine", "ejs");
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY)
const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"})


app.get('/',(req,res)=>{
    res.render('index')
})


app.get('/weather',async(req,res)=>{
    const city = req.query.city;
    // console.log(city)
    try{
        const weatherData = await getWeatherData(city)
        // console.log(weatherData.main.temp)
        const dietPlanData = await getDietPlan(weatherData.main.temp,weatherData.name)
        // console.log(dietPlanData)
        res.render('ind',{weather:weatherData,dietplan:dietPlanData}) 
    }catch(error){
        res.status(500).send("Error fetching weather data")
    }
})






async function getWeatherData(city) {

    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${process.env.WEATHER_API_KEY}`;
    try {
        const response = await fetch(weatherURL);
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
      console.log("Error fetching data:", error);
      throw error;
    }
}

async function getDietPlan(temperature,location){

    // console.log(temperature,location)

    const prompt = 'Generate a diet plan for a person living in ${location} where the current temperature is ${temperature}°C.'
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text
    // console.log(text);
}


app.listen(process.env.PORT,()=>{
    console.log("server is running")
})
