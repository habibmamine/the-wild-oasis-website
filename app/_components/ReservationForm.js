"use client";

import { differenceInDays } from "date-fns";
import { createBooking } from "../_lib/actions";
import { useReservation } from "./ReservationContext";
import SubmitButton from "./SubmitButton";

function ReservationForm({ cabin, user }) {
  const { range, resetRange } = useReservation();
  const { maxCapacity, regularPrice, discount, id } = cabin;

  const startDate = range?.from;
  const endDate = range?.to;

  const numNights = differenceInDays(endDate, startDate);
  const cabinPrice = numNights * (regularPrice - discount);

  const bookingData = { startDate, endDate, numNights, cabinPrice, cabinId: id };

  const createBookingWithData = createBooking.bind(null, bookingData);

  function handleSubmit(formData) {
    createBookingWithData(formData);
    resetRange();
  }

  return (
    <div className="scale-[1.01]">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          <img
            // Important to display google profile images
            referrerPolicy="no-referrer"
            className="h-8 rounded-full"
            src={user.image}
            alt={user.name}
          />
          <p>{user.name}</p>
        </div>
      </div>

      <form
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col"
        action={handleSubmit}
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-5">
          <input
            name="hasBreakfast"
            id="hasBreakfast"
            className="w-6 h-6 accent-accent-500 mt-[-1px]"
            type="checkbox"
          />
          <label htmlFor="hasBreakfast">Add breakfast</label>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">Anything we should know about your stay?</label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          {!startDate || !endDate ? (
            <p className="text-primary-300 text-base">Start by selecting dates</p>
          ) : (
            <SubmitButton pendingLabel="Reserving...">Reserve now</SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;