import { QueryClient, QueryClientProvider } from 'react-query';
import Weather from "./components/Weather";
import {SafeAreaView} from "react-native";

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaView>
                <Weather />
            </SafeAreaView>
        </QueryClientProvider>
    );
}
