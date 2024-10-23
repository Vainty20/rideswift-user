import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Popup } from "react-native-popup-confirm-toast";
import { deleteDoc, doc, runTransaction } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Colors } from "../constants/color";
import useCurrentLocation from "../hooks/useCurrentLocation";
import useCurrentBooking from "../hooks/useCurrentBooking";
import Map from "../components/ui/Map";
import BackButtonFAB from "../components/ui/BackButtonFAB";
import DestinationContainer from "../components/ui/DestinationContainer";
import DriverInfo from "../components/ui/DriverInfo";
import RideDetails from "../components/ui/RideDetails";
import LoadingScreen from "./LoadingScreen";
import DonationModal from "../components/modal/DonationModal";
import _ from "lodash";

export default function ViewCurrentBookingScreen({ route, navigation }) {
  const { id } = route.params;
  const timerRef = useRef(null);
  const currentRoute = useRoute();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const { location, locationCoordinates, loading } = useCurrentLocation();
  const { currentBooking } = useCurrentBooking({ id });

  const isNotConfirmedYet =
    currentBooking &&
    currentBooking.bookStatus === "pending" &&
    currentRoute.name === "ViewCurrentBooking";

  useEffect(() => {
    if (!id) {
      setCancelModalVisible(false);
      return;
    }

    if (currentBooking?.bookStatus === "dropoff") {
      setDonationModalVisible(true);
    }

    timerRef.current = setTimeout(() => {
      if (isNotConfirmedYet) {
        setCancelModalVisible(true);
      }
    }, 180000);

    return () => clearTimeout(timerRef.current);
  }, [id, currentBooking, currentRoute.name]);

  useEffect(() => {
    showAutomaticAlert();
  }, [cancelModalVisible]);

  const handleCancelledBooking = async () => {
    if (isNotConfirmedYet) {
      Popup.show({
        type: "confirm",
        title: "Cancel Booking",
        textBody: "Are you sure you want to cancel this booking?",
        buttonText: "Yes",
        confirmText: "No",
        iconEnabled: false,
        titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
        descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
        okButtonStyle: { backgroundColor: Colors.error400 },
        buttonContentStyle: { flexDirection: "row-reverse" },
        callback: async () => {
          const bookDocRef = doc(db, "book", currentBooking.id);

          await runTransaction(db, async (transaction) => {
            transaction.update(bookDocRef, {
              bookStatus: "cancelled",
            });
          });

          navigation.replace("Home");

          Popup.hide();
        },
        cancelCallback: () => {
          Popup.hide();
        },
      });
    }
  };

  const showAutomaticAlert = () => {
    if (cancelModalVisible) {
      Popup.show({
        type: "confirm",
        title: "Continue Booking",
        textBody:
          "It's been 3 minutes, do you still want to continue this ride?",
        buttonText: "Yes",
        confirmText: "No",
        iconEnabled: false,
        titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
        descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
        okButtonStyle: { backgroundColor: Colors.primaryColor },
        buttonContentStyle: { flexDirection: "row-reverse" },
        callback: () => {
          Popup.hide();
          clearTimeout(timerRef.current);
          setCancelModalVisible(false);
        },
        cancelCallback: async () => {
          const bookDocRef = doc(db, "book", currentBooking.id);

          await runTransaction(db, async (transaction) => {
            transaction.update(bookDocRef, {
              bookStatus: "cancelled",
            });
          });

          navigation.replace("Home");

          Popup.hide();
        },
      });
    }
  };

  const handleDonationModal = () => {
    setDonationModalVisible(false);
    navigation.replace("Home");
    return;
  };

  const handleDonationModalDebounced = _.debounce(handleDonationModal, 1000, {
    leading: true,
    trailing: false,
  });

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonFAB />
      <Map
        origin={location}
        originCoords={locationCoordinates}
        destination={currentBooking?.dropoffLocation}
        destinationCoords={currentBooking?.dropoffCoords}
      />
      <View style={styles.contentContainer}>
        <View style={styles.homeContainer}>
          <View style={styles.betweenContainer}>
            <Pressable style={styles.statusBtn}>
              <Text style={styles.statusBtnText}>
                {currentBooking?.bookStatus}
              </Text>
            </Pressable>
          </View>
          {currentBooking?.driverId ? (
            <DriverInfo
              profilePic={currentBooking.driverProfilePic}
              mobileNumber={currentBooking.driverMobileNumber}
              name={currentBooking.driverName}
              plateNumber={currentBooking.driverPlateNumber}
              isDarkBackground={true}
            />
          ) : null}

          <DestinationContainer
            pickupLocation={currentBooking?.pickupLocation}
            dropoffLocation={currentBooking?.dropoffLocation}
          />

          <RideDetails
            rideDistance={currentBooking?.rideDistance}
            ridePrice={currentBooking?.ridePrice}
            rideTime={currentBooking?.rideTime}
            isDarkBackground={true}
          />

          {isNotConfirmedYet ? (
            <Pressable style={styles.cancelBtn} onPress={handleCancelledBooking}>
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </Pressable>
          ) : null}
          <DonationModal
            visible={donationModalVisible}
            onRequestClose={handleDonationModalDebounced}
          />
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
    backgroundColor: Colors.primaryColor,
    width: "100%",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  betweenContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  statusBtn: {
    backgroundColor: Colors.secondaryColor,
    borderRadius: 12,
    padding: 15,
  },
  statusBtnText: {
    fontSize: 15,
    color: Colors.light,
    fontFamily: "DMSans_500Medium",
  },
  cancelBtn: {
    borderRadius: 20,
    borderWidth: 4,
    borderColor: Colors.error400,
    backgroundColor: Colors.light,
    alignItems: "center",
    padding: 11,
  },
  cancelText: {
    color: Colors.error400,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "DMSans_700Bold",
  },
});
