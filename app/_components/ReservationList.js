"use client";

import { deleteReservation } from "../_lib/actions";
import ReservationCard from "./ReservationCard";
import { useOptimistic } from "react";

export default function ReservationList({ bookings }) {
  const [optimisticBookings, optimisticFunction] = useOptimistic(
    bookings,
    (bookings, bookingId) => {
      return bookings.filter((booking) => booking.id !== bookingId);
    }
  );

  async function handleDelete(bookingId) {
    optimisticFunction(bookingId);
    await deleteReservation(bookingId);
  }

  return (
    <ul className="space-y-6">
      {optimisticBookings.map((booking) => (
        <ReservationCard booking={booking} key={booking.id} onDelete={handleDelete} />
      ))}
    </ul>
  );
}