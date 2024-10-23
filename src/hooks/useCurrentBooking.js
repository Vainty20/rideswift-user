import { useEffect, useState } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebaseConfig';

const useCurrentBooking = ({ id }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentBookingDocRef = doc(db, 'book', id);

    const unsubscribe = onSnapshot(
      currentBookingDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const fetchedCurrentBooking = { id: snapshot.id, ...snapshot.data() };
          setCurrentBooking(fetchedCurrentBooking);
        } else {
          throw new Error('Book document does not exist');
        }
      },
      (error) => {
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { currentBooking, error };
};

export default useCurrentBooking;
