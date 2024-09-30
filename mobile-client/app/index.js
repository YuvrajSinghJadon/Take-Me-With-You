import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

const Home = () => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-500">
      <Text className="text-blue-700">Come to Home</Text>
      <StatusBar style="auto" />
    </View>
  );
};

export default Home;
