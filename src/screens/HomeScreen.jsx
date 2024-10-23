import { useState } from "react";
import { useSelector } from "react-redux";
import { Popup } from "react-native-popup-confirm-toast";
import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/color";
import { fetchGeocodeFromAddress } from "../api/geocodeFromAddress";
import useCurrentLocation from "../hooks/useCurrentLocation";
import useFetchBookings from "../hooks/useFetchBookings";
import BookingForm from "../components/forms/BookingForm";
import Map from "../components/ui/Map";
import Button from "../components/ui/Button";
import UserHome from "../components/ui/UserHome";
import LoadingScreen from "./LoadingScreen";
import _ from "lodash";

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading: bookingLoading } = useFetchBookings();
  const {
    location,
    locationCoordinates,
    loading: locationLoading,
  } = useCurrentLocation();

  if (locationLoading || bookingLoading) return <LoadingScreen />;

  const latestOngoingBooking = bookings.find(
    (booking) =>
      booking.bookStatus !== "dropoff" && booking.bookStatus !== "cancelled"
  );

  const handleGoViewCurrentBooking = () => {
    navigation.push("ViewCurrentBooking", {
      id: latestOngoingBooking.id,
    });
  };

  const handleGoViewCurrentBookingDebounced = _.debounce(handleGoViewCurrentBooking, 1000, {
    leading: true,
    trailing: false,
  });

  const handleGoHome = async () => {
    if (!user.address) {
      Popup.show({
        type: "danger",
        title: "No Address!",
        textBody:
          "You have no address! Please update your address in settings.",
        buttonText: "OK",
        iconEnabled: false,
        titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
        descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
        okButtonStyle: { backgroundColor: Colors.primaryColor },
        timing: 5000,
        callback: () => Popup.hide(),
      });
      return;
    }
    try {
      const data = await fetchGeocodeFromAddress(user.address);
      const { lat, lng } = data.results[0].geometry.location;
      setAddress({ label: user.address, latitude: lat, longitude: lng });
    } catch (error) {
      Popup.show({
        type: "danger",
        title: "Error",
        textBody: error.message,
        buttonText: "OK",
        iconEnabled: false,
        titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
        descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
        okButtonStyle: { backgroundColor: Colors.error400 },
        timing: 5000,
        callback: () => Popup.hide(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Map
        user={user}
        origin={location}
        originCoords={locationCoordinates}
        isCurrentBook={latestOngoingBooking}
      />
      <View style={styles.contentContainer}>
        <View style={styles.homeContainer}>
          {user ? (
            <UserHome
              user={user}
              navigation={navigation}
              handleGoHome={handleGoHome}
              latestOngoingBooking={latestOngoingBooking}
            />
          ) : null}

          {!latestOngoingBooking ? (
            <BookingForm
              user={user}
              address={address}
              setAddress={setAddress}
              origin={location}
              originCoords={locationCoordinates}
              navigation={navigation}
            />
          ) : (
            <>
              <View style={styles.space} />
              <Button
                text="View Current Booking"
                onPress={handleGoViewCurrentBookingDebounced}
              />
            </>
          )}
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
  },
  space: {
    height: 20,
    width: 20,
  },
});
