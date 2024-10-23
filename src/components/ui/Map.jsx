import MapView, { Marker, Polyline } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import { Image, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { radius } from "../../constants/map";
import { fetchDirections } from "../../api/directionsApi";
import { decodePolyline } from "../../utils/decodePolyline";
import { customMapStyle } from "../../utils/customMapStyle";
import { handleMapPress } from "../../utils/handleMapPress";
import Ionicons from "react-native-vector-icons/Ionicons";
import _ from "lodash";

export default function Map({
  user,
  origin,
  originCoords,
  destination,
  destinationCoords,
  isCurrentBook,
}) {
  const mapRef = useRef(null);
  const currentRoute = useRoute();
  const navigation = useNavigation();
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);

  const onMapPress = async (event) => {
    if (isCurrentBook) return;
    if (currentRoute.name === "Home") {
      const { coordinate } = event.nativeEvent;
      await handleMapPress({
        coordinate,
        origin,
        originCoords,
        radius,
        navigation,
        user,
      });
    }
  };

  const handleOnMapPressDebounced = _.debounce(onMapPress, 1000, {
    leading: true,
    trailing: false,
  });

  useEffect(() => {
    if (!originCoords || !destinationCoords) return;

    mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
    });

    fetchPolylineCoordinates();
  }, [originCoords, destinationCoords]);

  const fetchPolylineCoordinates = async () => {
    try {
      const data = await fetchDirections(originCoords, destinationCoords);
      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const polylineCoords = decodePolyline(points);
        setPolylineCoordinates(polylineCoords);
      }
    } catch (error) {
      console.error("Error fetching polyline coordinates: ", error);
    }
  };

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      customMapStyle={customMapStyle}
      onPress={handleOnMapPressDebounced}
      showsBuildings={true}
      initialRegion={{
        latitude: originCoords[0] || 16.0439,
        longitude: originCoords[1] || 120.3331,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {polylineCoordinates.length > 0 && (
        <Polyline
          coordinates={polylineCoordinates}
          strokeColor="#0066cc"
          strokeWidth={5}
        />
      )}

      {originCoords && (
        <Marker
          coordinate={{ latitude: originCoords[0], longitude: originCoords[1] }}
          title="Your Location"
          description={origin || ""}
          identifier="origin"
        >
          <Image
            style={{
              width: 32,
              height: 32,
              borderWidth: 2.5,
              borderColor: "#0066cc",
              borderRadius: 50,
            }}
            source={{
              uri:
                (user && user.profilePicture) ||
                "https://i.stack.imgur.com/l60Hf.png",
            }}
          />
        </Marker>
      )}
      {destinationCoords &&
        destinationCoords[0] !== 0 &&
        destinationCoords[1] !== 0 && (
          <Marker
            coordinate={{
              latitude: destinationCoords[0],
              longitude: destinationCoords[1],
            }}
            title="Destination"
            description={destination || ""}
            identifier="destination"
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderWidth: 2.5,
                borderColor: "#0066cc",
                borderRadius: 50,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="bicycle" color="#0066cc" size={20} />
            </View>
          </Marker>
        )}
    </MapView>
  );
}
