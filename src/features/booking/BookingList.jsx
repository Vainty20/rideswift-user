import { FlatList } from "react-native";
import { Colors } from "../../constants/color";
import { Popup } from "react-native-popup-confirm-toast";
import { updateDoc, collection, doc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import useFetchBookings from "../../hooks/useFetchBookings";
import Loading from "../../components/ui/Loading";
import ErrorText from "../../components/ui/ErrorText";
import BookingCard from "../../components/cards/BookingHistoryCard";
import _ from "lodash";

export default function BookingList({ navigation }) {
  const { bookings, loading, error } = useFetchBookings();

  const bookingsHistory = bookings.filter(
    (book) => book.bookStatus === "dropoff"
  );

  if (loading) return <Loading />;
  if (error) return <ErrorText error={error} />;
  if (!loading && bookingsHistory.length === 0)
    return <ErrorText error="You have no bookings yet." />;

  const handleSetRating = (id, currentRating, rating) => {
    if (currentRating !== 0) return;

    Popup.show({
      type: "confirm",
      title: "Ratings",
      textBody: `Are you sure you want to rate this booking a ${rating} rating?`,
      buttonText: "Yes",
      confirmText: "No",
      iconEnabled: false,
      titleTextStyle: { fontFamily: "DMSans_700Bold", textAlign: "left" },
      descTextStyle: { fontFamily: "DMSans_400Regular", textAlign: "left" },
      okButtonStyle: { backgroundColor: Colors.primaryColor },
      buttonContentStyle: { flexDirection: "row-reverse" },
      callback: async () => {
        try {
          const bookRef = doc(collection(db, "book"), id);
          await updateDoc(bookRef, { rating });
          Popup.hide();
        } catch (error) {
          console.error("Error updating rating: ", error);
          Popup.hide();
        }
      },
      cancelCallback: () => {
        Popup.hide();
      },
    });
  };

  const handleGoReport = (item) => {
    navigation.push("CreateReport", { item });
  };

  const handleGoReportDebounced = _.debounce(handleGoReport, 1000, {
    leading: true,
    trailing: false,
  });

  const keyExtractor = (item, index) => item.id || index.toString();

  const renderItem = ({ item }) => (
    <BookingCard
      item={item}
      onRate={(newRating) => handleSetRating(item.id, item.rating, newRating)}
      onReport={() => handleGoReportDebounced(item)}
    />
  );

  return (
    <FlatList
      data={bookingsHistory}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}
