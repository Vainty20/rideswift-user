import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import { Colors } from "../constants/color";
import { Popup } from "react-native-popup-confirm-toast";
import Map from "../components/ui/Map";
import Button from "../components/ui/Button";
import BackButtonFAB from "../components/ui/BackButtonFAB";
import DestinationContainer from "../components/ui/DestinationContainer";
import RideDetails from "../components/ui/RideDetails";

export default function BookingConfirmScreen({ route, navigation }) {
  const {
    user,
    pickupLocation,
    pickupCoordinates,
    dropoffLocation,
    dropoffCoordinates,
    rideInfo,
  } = route.params;
  const [loading, setLoading] = useState(false);

  const createBooking = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (
        !pickupLocation ||
        !dropoffLocation ||
        !pickupCoordinates ||
        !dropoffLocation ||
        !dropoffCoordinates ||
        !user.firstName ||
        !user.lastName ||
        !user.mobileNumber ||
        !user.weight
      ) {
        throw new Error(
          "Incomplete Information, Please fill in all required fields."
        );
      }

      const bookingData = {
        pickupCoords: pickupCoordinates,
        dropoffCoords: dropoffCoordinates,
        pickupLocation: pickupLocation,
        dropoffLocation: dropoffLocation,
        userId: auth.currentUser.uid,
        userName: user.firstName + " " + user.lastName,
        userMobileNumber: user.mobileNumber,
        userProfilePic: user.profilePic,
        userWeight: user.weight,
        driverId: "",
        driverProfilePic: "",
        driverName: "",
        driverMobileNumber: "",
        driverVehicle: "",
        driverPlateNumber: "",
        rideTime: rideInfo.rideTime,
        rideDistance: rideInfo.rideDistance,
        ridePrice: rideInfo.ridePrice,
        bookStatus: "pending",
        rating: 0,
        createdAt: serverTimestamp(),
      };

      Popup.show({
        type: "confirm",
        title: "Booking Confirmation",
        textBody: "Do you want to confirm the booking?",
        buttonText: "Yes",
        confirmText: "No",
        iconEnabled: false,
        titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
        descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
        okButtonStyle: { backgroundColor: Colors.primaryColor },
        buttonContentStyle: { flexDirection: "row-reverse" },
        callback: async () => {
          await addDoc(collection(db, "book"), bookingData);
          navigation.replace("Home");
          Popup.hide();
        },
        cancelCallback: () => {
          Popup.hide();
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonFAB />
      <Map
        origin={pickupLocation}
        originCoords={pickupCoordinates}
        destination={dropoffLocation}
        destinationCoords={dropoffCoordinates}
      />
      <View style={styles.contentContainer}>
        <View style={styles.homeContainer}>
          <RideDetails
            rideDistance={rideInfo.rideDistance}
            ridePrice={rideInfo.ridePrice}
            rideTime={rideInfo.rideTime}
          />
          <DestinationContainer
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
          />
          <Button text="Confirm" onPress={createBooking} loading={loading} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: Colors.bgBase100,
  },
  contentContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    position: "absolute",
    margin: 12,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  homeContainer: {
    backgroundColor: Colors.bgBase100,
    width: "100%",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
});
