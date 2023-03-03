import {useEffect, useState} from "react";
import { useQuery} from "react-query";
import {Text, TextInput, TouchableOpacity, View} from "react-native";


interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    cityName: string;
}

class WeatherError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WeatherError";
    }
}


const fetchWeatherData = async (cityName: string, apiKey: string): Promise<WeatherData> => {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}&aqi=no`
        );
        if (!response.ok) {
            throw new WeatherError("Network response was not ok");
        }
        const data = await response.json();
        return {
            temperature: data.current.temp_c,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph,
            cityName: data.location.name,
        };
    } catch (error) {
        throw new WeatherError((error as WeatherError).message);
    }
};


export default function Weather() {
    const [cityName, setCityName] = useState<string>("London");
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const [textInputRef, setTextInputRef] = useState<TextInput | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const apiKey = "f41ec08d60a84999880103744230203";
    const { isLoading, isError, data, error, refetch } = useQuery<WeatherData>(
        ["weather", cityName],
        async () => {
            if (isButtonPressed) {
                return await fetchWeatherData(cityName, apiKey);
            }
            return {} as WeatherData;
        },
        {
            enabled: isButtonPressed,
            initialData: {} as WeatherData,
        }
    );

    const handleRefresh = async () => {
        if (cityName.trim() === "") {
            return; // do not fetch weather data if city name is empty
        }
        setIsButtonPressed(true);
        const data = await fetchWeatherData(cityName, apiKey);
        setIsButtonPressed(false);
        setWeatherData(data);
        setCityName("");
        textInputRef?.focus();
    };

    useEffect(() => {
        handleRefresh();
    }, []);

    useEffect(() => {
        if (isButtonPressed) {
            refetch();
        }
    }, [isButtonPressed, refetch]);

    if (isLoading) {
        return <Text>Loading...</Text>;
    }
    if (isError) {
        return (
            <View>
                <Text>Error: {(error as WeatherError).message}</Text>
            </View>
        );
    }
    if (!data) {
        return null;
    }

    return (
        <View>
            <TextInput
                ref={(ref) => setTextInputRef(ref)}
                value={cityName}
                onChangeText={setCityName}
                placeholder="Enter city name"
                style={{ borderWidth: 1, padding: 8, margin: 8 }}
                onSubmitEditing={handleRefresh}
                editable={!isButtonPressed}
            />
            <TouchableOpacity
                style={{ padding: 8 }}
                onPress={handleRefresh}
                disabled
={isButtonPressed}>
            <Text>check forecast</Text>
            </TouchableOpacity>
            {weatherData && (
                <View style={{ padding: 8 }}>
                    <Text>City name: {weatherData.cityName}</Text>
                    <Text>Temperature: {weatherData.temperature} C</Text>
                    <Text>Humidity: {weatherData.humidity} %</Text>
                    <Text>Wind speed: {weatherData.windSpeed} kph</Text>
                </View>
            )}
        </View>
    );
}
