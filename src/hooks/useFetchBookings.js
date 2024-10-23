import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

const useFetchBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = () => {
      try {
        const bookingsCollection = collection(db, "book");
        const bookingsQuery = query(
          bookingsCollection,
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
          bookingsQuery,
          (bookingsSnapshot) => {
            const bookingsData = bookingsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setBookings(bookingsData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user data and bookings:", error);
            setError(error);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return { bookings, loading, error };
};

export default useFetchBookings;
