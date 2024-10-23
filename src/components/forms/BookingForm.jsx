import { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/color";
import { calculatePrice } from "../../utils/calculatePrice";
import { fetchDistanceMatrix } from "../../api/distanceMatrixApi";
import Button from "../ui/Button";
import PlacesInput from "../ui/PlacesInput";
import Ionicons from "react-native-vector-icons/Ionicons";
import _ from "lodash";

export default function BookingForm({
  user,
  address,
  setAddress,
  origin,
  originCoords,
  navigation,
}) {
  const [dropoffCoords, setDropoffCoords] = useState([]);
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (address) {
      setDropoffLocation(address.label);
      setDropoffCoords([address.latitude, address.longitude]);
    }
  }, [address]);

  const handleCalculateRideInfo = async () => {
    try {
      const distanceMatrixResponse = await fetchDistanceMatrix(
        originCoords,
        dropoffCoords
      );
      const { duration, distance } = distanceMatrixResponse.rows[0].elements[0];
      const price = calculatePrice(distance.value);

      await navigation.push("BookingConfirm", {
        user,
        pickupLocation: origin,
        pickupCoordinates: originCoords,
        dropoffLocation: dropoffLocation,
        dropoffCoordinates: dropoffCoords,
        rideInfo: {
          rideTime: duration.text,
          rideDistance: distance.text,
          ridePrice: price,
        },
      });
    } catch (error) {
      console.error("Error calculating ride info:", error);
      setErrorMessage(error.message);
    }
  };

  const handleCalculateRideInfoDebounced = _.debounce(
    handleCalculateRideInfo,
    1000,
    {
      leading: true,
      trailing: false,
    }
  );

  const clearSelection = () => {
    setAddress("");
    setDropoffLocation("");
    setDropoffCoords([0, 0]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.destinationContainer}>
        <View style={styles.destinationRow}>
          <Ionicons
            name="radio-button-on"
            color={Colors.primaryColor}
            size={25}
          />
          <View>
            <Text style={styles.destinationLabel}>Pickup:</Text>
            <Text style={styles.destination}>{origin}</Text>
          </View>
        </View>
        <Ionicons
          name="arrow-down-outline"
          color={Colors.textColor}
          style={{ marginBottom: 12 }}
          size={24}
        />
        <PlacesInput
          currentAddress={address?.label || ""}
          placeholder="Enter your destination"
          onPlaceSelected={({ description, coordinates }) => {
            setDropoffLocation(description);
            setDropoffCoords(coordinates);
          }}
        />
      </View>
      {dropoffLocation ? (
        <View style={styles.row}>
          <View style={styles.gridItem}>
            <Button
              text="Book"
              onPress={() => {
                if (dropoffLocation) {
                  handleCalculateRideInfoDebounced();
                }
              }}
            />
          </View>
          <View style={styles.gridItem}>
            <Button variant="secondary" text="Clear" onPress={clearSelection} />
          </View>
        </View>
      ) : null}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: Colors.bgBase200,
    borderRadius: 20,
    marginTop: 12,
    padding: 6,
    gap: 8,
  },
  destinationContainer: {
    backgroundColor: Colors.bgBase200,
    padding: 16,
  },
  destinationLabel: {
    fontSize: 17,
    marginBottom: 4,
    color: Colors.textColor,
    fontFamily: "DMSans_700Bold",
  },
  destination: {
    fontSize: 15,
    color: Colors.textColor,
    fontFamily: "DMSans_500Medium",
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
  },
  errorText: {
    textAlign: "center",
    fontFamily: "DMSans_500Medium",
    color: Colors.error400,
    fontSize: 13,
    marginTop: 12,
  },
});
