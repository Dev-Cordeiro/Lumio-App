import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "slide1",
    image: require("../assets/onboarding/slide1.png"),
    title: "A vida é curta e o mundo é \nvasto",
    highlight: "vasto",
    description:
      "Lumio: Seu guia de viagem personalizado. Crie roteiros sob medida com inteligência artificial e sugestões que combinam com seu estilo, orçamento e interesses. Viaje do seu jeito, com praticidade e inteligência.",
    button: "Comece agora",
  },
  {
    key: "slide2",
    image: require("../assets/onboarding/slide2.png"),
    title: "É um mundo grande lá fora, vá \nexplorá-lo",
    highlight: "explorá-lo",
    description:
      "Para aproveitar ao máximo a sua aventura, você só precisa partir e ir para onde quiser. Estamos esperando por você.",
    button: "Próximo",
  },
  {
    key: "slide3",
    image: require("../assets/onboarding/slide3.png"),
    title: "A próxima aventura está \na um passo de distância",
    highlight: "distância",
    description:
      "Chegou a hora de viver novas histórias. Planeje sua próxima viagem com liberdade e praticidade.",
    button: "Iniciar",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const router = useRouter();

  const handleNext = async () => {
    const nextIndex = current + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrent(nextIndex);
    } else {
      // marca como visto e vai para welcome
      await AsyncStorage.setItem("onboardingSeen", "true");
      router.replace("/welcome");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboardingSeen", "true");
    router.replace("/welcome");
  };

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title}>
          {item.title.split(item.highlight)[0]}
          <Text style={styles.highlight}>{item.highlight}</Text>
          {item.title.split(item.highlight)[1]}
        </Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, current === i && styles.activeDot]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{item.button}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.skip} onPress={handleSkip}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>
    </View>
  );

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(index);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      extraData={current}
      onMomentumScrollEnd={onMomentumScrollEnd}
      // se quiser habilitar swipe manual:
      // scrollEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width,
    height: 320,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  highlight: {
    color: "#ff7a00",
    fontWeight: "bold",
  },
  description: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d0d0d0",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#1677ff",
    width: 16,
  },
  button: {
    backgroundColor: "#1677ff",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  skip: {
    position: "absolute",
    top: 32,
    right: 24,
  },
  skipText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textShadowColor: "#0002",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
