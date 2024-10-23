import { View, Text, StyleSheet } from "react-native";
import { formatDate } from "../../utils/formatDate";
import { Colors } from "../../constants/color";
import StarRating from "react-native-star-rating-widget";
import Button from "../ui/Button";
import DestinationContainer from "../ui/DestinationContainer";
import DriverInfo from "../ui/DriverInfo";
import RideDetails from "../ui/RideDetails";

export default function BookingCard({ item, onRate, onReport }) {
  return (
    <View style={styles.card}>
      {item.driverId ? (
        <DriverInfo
          profilePic={item.driverProfilePic}
          mobileNumber={item.driverMobileNumber}
          name={item.driverName}
          plateNumber={item.driverPlateNumber}
        />
      ) : null}
      <DestinationContainer
        pickupLocation={item.pickupLocation}
        dropoffLocation={item.dropoffLocation}
      />
      <RideDetails
        rideDistance={item.rideDistance}
        ridePrice={item.ridePrice}
        rideTime={item.rideTime}
      />
      <View style={styles.betweenContainer}>
        <View>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <StarRating starSize={25} rating={item.rating} onChange={onRate} />
        </View>
        <Button text="Report!" variant="danger" onPress={onReport} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  betweenContainer: {
    marginVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    marginBottom: 6,
    color: Colors.textColor,
  },
});
