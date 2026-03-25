import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const APIKey = "a5666b872e034e2986dd039230bf24cb";

app.get("/", (req, res) => {
    res.render("location");
});

app.post("/weather", async (req, res) => {

    const { latitude, longitude } = req.body;
    try {

        // Get Current Date
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
        const date = now.getDate();
        const month = now.toLocaleDateString('en-US', { month: 'long' });
        const currentDate = `${day}, ${date} ${month}`;

        // Get city name from coordinates
        const geoResponse = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${APIKey}`
        );
        const geoResponseResult= geoResponse.data;
        const cityComponents = geoResponseResult.results[0].components;
        const city = cityComponents.city || cityComponents.town || cityComponents.village || cityComponents.country;

        // Get weather data for the city
        const weatherResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&forecast_hours=6&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`
        );
        const weather = weatherResponse.data;
        console.log("Weather Data:", weather);

        // Current
        const currentTemperature = weather.current.temperature_2m;
        let currentWeatherCode = weather.current.weather_code;

        let currentIconName = "";
        switch (currentWeatherCode) {
            case 0:
                currentIconName = "Clear.png";
                break;
            case 1:
            case 2:
                currentIconName = "Partly Cloud.png";
                break;
            case 3:
                currentIconName = "Cloudy.png";
                break;
            case 45:
            case 48:
                currentIconName = "Fog.png";
                break;
            case 61:
            case 63:
            case 65:
            case 66:
            case 67:
            case 80:
            case 81:
            case 82:
                currentIconName = "Rainy.png";
                break;
            case 71:
            case 73:
            case 75:
            case 77:
            case 85:
            case 86:
                currentIconName = "Snowy.png";
                break;
            case 95:
            case 96:
            case 99:
                currentIconName = "ThunderStorm.png";
            default:
                currentIconName = "Clear.png";
        }

        const currentWeatherIcon = `/Assets/${currentIconName}`;
        const currentWeatherName = currentIconName.split(".")[0].toUpperCase();

        // Hourly
        const hourlyTime = weather.hourly.time.slice(0, 6);
        const hourlyForecast = hourlyTime.map((time, i) => {

            const hour = new Date(time).getHours();

            const hourlyCode = weather.hourly.weather_code[i];

            let hourlyIconName = "";

            switch (hourlyCode) {
                case 0:
                    hourlyIconName = "Clear.png";
                    break;
                case 1:
                case 2:
                    hourlyIconName = "Partly Cloud.png";
                    break;
                case 3:
                    hourlyIconName = "Cloudy.png";
                    break;
                case 45:
                case 48:
                    hourlyIconName = "Fog.png";
                    break;
                case 61:
                case 63:
                case 65:
                case 66:
                case 67:
                case 80:
                case 81:
                case 82:
                    hourlyIconName = "Rainy.png";
                    break;
                case 71:
                case 73:
                case 75:
                case 77:
                case 85:
                case 86:
                    hourlyIconName = "Snowy.png";
                    break;
                case 95:
                case 96:
                case 99:
                    hourlyIconName = "ThunderStorm.png";
                default:
                    hourlyIconName = "Clear.png";
            }

            return {
                hours: hour,
                temperature: weather.hourly.temperature_2m[i],
                weatherIcon: `/Assets/${hourlyIconName}`
            };
        });

        // Daily
        const dailyTime = weather.daily.time;
        const dailyForecast = dailyTime.map((date, i) => {

            const dayName = i === 0
                ? "Today"
                : new Date(date).toLocaleDateString("en-US", { weekday: "short" })
            ;
            const dailyCode = weather.daily.weather_code[i];
            
            let dailyIconName = "";
            switch (dailyCode) {
                case 0:
                    dailyIconName = "Clear.png";
                    break;
                case 1:
                case 2:
                    dailyIconName = "Partly Cloud.png";
                    break;
                case 3:
                    dailyIconName = "Cloudy.png";
                    break;
                case 45:
                case 48:
                    dailyIconName = "Fog.png";
                    break;
                case 61:
                case 63:
                case 65:
                case 66:
                case 67:
                 case 80:
                case 81:
                case 82:
                    dailyIconName = "Rainy.png";
                    break;
                case 71:
                case 73:
                case 75:
                case 77:
                case 85:
                case 86:
                    dailyIconName = "Snowy.png";
                    break;
                case 95:
                case 96:
                case 99:
                    dailyIconName = "ThunderStorm.png";
            }


            return {
                day: dayName,
                maxTemp: weather.daily.temperature_2m_max[i],
                weatherIcon : `/Assets/${dailyIconName}`,
                weatherName : dailyIconName.split(".")[0].toUpperCase(),
            };

        });

        res.render("weather", {

            city,
            currentDate,
            weather,
            currentWeatherIcon,
            currentWeatherName,
            currentTemperature,
            hourlyForecast,
            dailyForecast,
            error: null

        });

    } catch (error) {

        console.error("Failed to make request:", error.message);
        res.render("weather", { 

            error: error.message,
            city: null,
            weather: null,
            currentDate: null,
            currentWeatherIcon: null,
            currentWeatherName: null,
            currentTemperature: null,
            hourlyForecast: [],
            dailyForecast: [] 

        });
    }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});