import { Popup } from "react-native-popup-confirm-toast";
import { calculateDistance } from "./calculateDistance";
import { calculatePrice } from "./calculatePrice";
import { fetchGeocode } from "../api/geocodeApi";
import { checkWaterLocation } from "../api/waterCheckApi";
import { fetchDistanceMatrix } from "../api/distanceMatrixApi";
import { Colors } from "../constants/color";

export const handleMapPress = async ({
  coordinate,
  origin,
  originCoords,
  radius,
  navigation,
  user,
}) => {
  const distance = calculateDistance(
    coordinate.latitude,
    coordinate.longitude,
    originCoords[0],
    originCoords[1]
  );

  if (distance > radius) {
    Popup.show({
      type: "danger",
      title: "Location Outside Desired Area",
      textBody: `Please choose a location within ${radius} km of Dagupan City.`,
      buttonText: "OK",
      iconEnabled: false,
      titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
      descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
      iconHeaderStyle: { color: "white" },
      okButtonStyle: { backgroundColor: Colors.error400 },
      timing: 5000,
      callback: () => Popup.hide(),
    });
    return;
  }

  const waterResponse = await checkWaterLocation(
    coordinate.latitude,
    coordinate.longitude
  );

  if (waterResponse.water) {
    Popup.show({
      type: "danger",
      title: "Location Selection Error",
      textBody:
        "Oops! It seems you've selected a location within a water area. Please choose a location that is on land.",
      buttonText: "OK",
      iconEnabled: false,
      titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
      descTextStyle: {
        fontFamily: "DMSans_400Regular",
        textAlign: "left",
      },
      iconHeaderStyle: { color: "white" },
      okButtonStyle: { backgroundColor: Colors.error400 },
      timing: 5000,
      callback: () => Popup.hide(),
    });
    return;
  }

  const geoResponse = await fetchGeocode(
    coordinate.latitude,
    coordinate.longitude
  );

  if (geoResponse && geoResponse.results && geoResponse.results.length > 0) {
    const formattedAddress = geoResponse.results[0].formatted_address;
    Popup.show({
      type: "confirm",
      title: "Create Booking",
      textBody: `Dropoff: ${formattedAddress}`,
      buttonText: "Yes",
      confirmText: "No",
      iconEnabled: false,
      titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
      descTextStyle: {
        fontFamily: "DMSans_400Regular",
        textAlign: "left",
      },
      okButtonStyle: { backgroundColor: Colors.primaryColor },
      buttonContentStyle: { flexDirection: "row-reverse" },
      callback: async () => {
        try {
          const distanceMatrixResponse = await fetchDistanceMatrix(
            originCoords,
            [coordinate.latitude, coordinate.longitude]
          );
          const { duration, distance } =
            distanceMatrixResponse.rows[0].elements[0];

          const price = calculatePrice(distance.value);
          Popup.hide();
          await navigation.push("BookingConfirm", {
            user,
            pickupLocation: origin,
            pickupCoordinates: originCoords,
            dropoffLocation: formattedAddress,
            dropoffCoordinates: [
              coordinate.latitude,
              coordinate.longitude,
            ],
            rideInfo: {
              rideTime: duration.text,
              rideDistance: distance.text,
              ridePrice: price,
            },
          });
        } catch (error) {
          console.error("Error updating booking: ", error);
          Popup.hide();
        }
      },
      cancelCallback: () => {
        Popup.hide();
      },
    });
  } else {
    Popup.show({
      type: "danger",
      title: "No Address Found",
      textBody: "Failed to retrieve address information.",
      buttonText: "OK",
      iconEnabled: false,
      titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
      descTextStyle: {
        fontFamily: "DMSans_400Regular",
        textAlign: "left",
      },
      iconHeaderStyle: { color: "white" },
      okButtonStyle: { backgroundColor: Colors.error400 },
      timing: 5000,
      callback: () => Popup.hide(),
    });
  }
};
